import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { Maybe } from '../../../../../lib/types/maybe';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ConnectionRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../repositories/note-query-repository.interface';
import { NoteAboutResourceCreated } from './note-about-resource-created.event';
import { NoteAboutResourceCreatedEventHandler } from './note-about-resource-created.event-handler';

const WIDGET_COLLECTION = 'widget__VIEWS';

class WidgetViewModel {
    id: string;
    name: MultilingualText;
    notes: NoteRecordForResourceViewModel[];

    constructor({ id, name, notes }: DTO<WidgetViewModel>) {
        this.id = id;

        this.name = new MultilingualText(name);

        this.notes = notes.map((n) => {
            return NoteRecordForResourceViewModel.fromDto(n);
        });
    }
}

const noteText = 'my note';

const knownNotes: NoteRecordForResourceViewModel[] = [
    {
        id: buildDummyUuid(55),
        note: buildMultilingualTextWithSingleItem(noteText),
        context: { type: EdgeConnectionContextType.general },
    },
];

const existingWidgetView = new WidgetViewModel({
    id: buildDummyUuid(4),
    name: buildMultilingualTextWithSingleItem('weather widget'),
    notes: [],
});

class WidgetQueryRepository {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );
    }

    async fetchById(id: string): Promise<Maybe<WidgetViewModel>> {
        const aql = `
        for doc,edge in 0..1 any "${WIDGET_COLLECTION}/${id}" graph web_of_knowledge
        return {
            doc,
            edge
        }
        `;

        const cursor = await this.arangoDb.query({ query: aql, bindVars: {} });

        const results = await cursor.all();

        if (results.length === 0) {
            return NotFound;
        }

        const [{ doc: widgetDoc }, ...connectedDocsAndEdges] = results;

        const { notes, connections } = connectedDocsAndEdges.reduce(
            (acc, { doc: _doc, edge }) => {
                if (edge.connectionType === EdgeConnectionType.self) {
                    const noteRecord: NoteRecordForResourceViewModel = {
                        id: edge._key,
                        note: new MultilingualText(edge.text),
                        context: edge.connectedResources.self,
                    };

                    if (!acc.notes.some((note) => note.id === noteRecord.id)) {
                        acc.notes.push(noteRecord);
                    }

                    return acc;
                }

                const myRole =
                    edge._to == `widget__VIEWS/${id}`
                        ? EdgeConnectionMemberRole.to
                        : EdgeConnectionMemberRole.from;

                const connection: ConnectionRecordForResourceViewModel = {
                    id: edge.id,
                    note: new MultilingualText(edge.text),
                    selfContext:
                        myRole === EdgeConnectionMemberRole.from
                            ? edge.connectedResources.from.context
                            : edge.connectedResources.to.context,
                    other:
                        myRole === EdgeConnectionMemberRole.from
                            ? edge.connectedResources.to.resource
                            : edge.connectedResources.from.resource,
                    otherContext:
                        myRole === EdgeConnectionMemberRole.from
                            ? edge.connectedResources.to.context
                            : edge.connectedResources.from.context,
                    role: EdgeConnectionMemberRole.to,
                };

                acc.connections.push(connection);

                return acc;
            },
            {
                notes: [],
                connections: [],
            }
        );

        const widgetDocWithNotes = mapDatabaseDocumentToAggregateDTO({
            ...widgetDoc,
            notes,
            connections,
        });

        // @ts-expect-error TODO Add a type assertion to the query result at the top level
        return new WidgetViewModel(widgetDocWithNotes);
    }

    async create(w: WidgetViewModel): Promise<void> {
        await this.arangoDb.create(mapEntityDTOToDatabaseDocument(w)).catch((e) => {
            throw e;
        });
    }

    async update(id: AggregateId, w: DeepPartial<DTO<WidgetViewModel>>): Promise<void> {
        await this.arangoDb.update(id, w);
    }
}

describe(`NoteAboutResourceCreatedEventHandler`, () => {
    const noteCreated = new TestEventStream().buildSingle<NoteAboutResourceCreated>({
        type: 'NOTE_ABOUT_RESOURCE_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: knownNotes[0].id,
            },
            resourceCompositeIdentifier: {
                type: 'widget' as ResourceType,
                id: existingWidgetView.id,
            },
            text: noteText,
        },
    });

    let testQueryRepository: WidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let noteAboutResourceCreatedEventHandler: NoteAboutResourceCreatedEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new WidgetQueryRepository(connectionProvider);

        noteAboutResourceCreatedEventHandler = new NoteAboutResourceCreatedEventHandler(
            app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        );

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await databaseProvider.clearViews();

        await testQueryRepository.create(existingWidgetView);
    });

    describe(`when the target resource exists and has no notes`, () => {
        it(`should create the note`, async () => {
            await noteAboutResourceCreatedEventHandler.handle(noteCreated);

            const updatedView = (await testQueryRepository.fetchById(
                existingWidgetView.id
            )) as WidgetViewModel;

            expect(updatedView.notes).toHaveLength(1);

            expect(updatedView.notes[0].note.getOriginalTextItem().text).toBe(noteText);
        });
    });
});
