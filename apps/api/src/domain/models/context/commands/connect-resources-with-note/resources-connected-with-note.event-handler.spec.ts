import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionContext,
    LanguageCode,
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
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';
import { ResourcesConnectedWithNoteEventHandler } from './resources-connected-with-note.event-handler';

const WIDGET_COLLECTION = 'widget__VIEWS';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

class WidgetViewModel {
    id: string;

    connections: ConnectionRecordForResourceViewModel[];

    notes: NoteRecordForResourceViewModel[];

    constructor({ id, connections, notes }: DTO<WidgetViewModel>) {
        this.id = id;

        this.connections = connections.map((dto) =>
            ConnectionRecordForResourceViewModel.fromDto(dto)
        );

        this.notes = notes.map((dto) => NoteRecordForResourceViewModel.fromDto(dto));
    }
}

const existingWidgetViewForToMember = new WidgetViewModel({
    id: buildDummyUuid(9),
    connections: [],
    notes: [],
});

const existingWidgetViewForFromMember = new WidgetViewModel({
    id: buildDummyUuid(10),
    connections: [],
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
                        context: edge.context,
                    };

                    acc.notes.push(noteRecord);
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
                    otherCompositeIdentifier:
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
            notes, // .map
            connections, // .map
        });

        // @ts-expect-error FIX THIS!
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

const generalContext: IEdgeConnectionContext = {
    type: EdgeConnectionContextType.general,
};

const textForConnectionNote = 'This is why the widgets are related';

const languageCodeForNote = LanguageCode.English;

const resourcesConnected = new TestEventStream().buildSingle<ResourcesConnectedWithNote>({
    type: 'RESOURCES_CONNECTED_WITH_NOTE',
    payload: {
        toMemberCompositeIdentifier: {
            type: WIDGET_RESOURCE_TYPE,
            id: existingWidgetViewForToMember.id,
        },
        toMemberContext: generalContext,
        fromMemberCompositeIdentifier: {
            type: WIDGET_RESOURCE_TYPE,
            id: existingWidgetViewForFromMember.id,
        },
        fromMemberContext: generalContext,
        text: textForConnectionNote,
        languageCode: languageCodeForNote,
    },
});

describe(`ResourcesConnectedWithNoteEventHandler`, () => {
    let testQueryRepository: WidgetQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let resourcesConnectedWithNoteEventHandler: ResourcesConnectedWithNoteEventHandler;

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

        resourcesConnectedWithNoteEventHandler = new ResourcesConnectedWithNoteEventHandler(
            app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        );

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await databaseProvider.getDatabaseForCollection('note__VIEWS').clear();

        await testQueryRepository.create(existingWidgetViewForToMember);

        await testQueryRepository.create(existingWidgetViewForFromMember);
    });

    describe(`when there is an existing resource with no connections`, () => {
        describe(`when adding a first connection`, () => {
            it(`should add the connection`, async () => {
                await resourcesConnectedWithNoteEventHandler.handle(resourcesConnected);

                // check the to member
                const updatedToMember = (await testQueryRepository.fetchById(
                    existingWidgetViewForToMember.id
                )) as WidgetViewModel;

                expect(updatedToMember.connections).toHaveLength(1);

                const newConnectionForToMember = updatedToMember.connections[0];

                expect(newConnectionForToMember.otherCompositeIdentifier).toEqual({
                    type: WIDGET_RESOURCE_TYPE,
                    id: existingWidgetViewForFromMember.id,
                });

                expect(newConnectionForToMember.otherContext).toEqual(generalContext);

                expect(newConnectionForToMember.role).toBe(EdgeConnectionMemberRole.to);

                const expectedNote = // this looks too much like the implementation
                    buildMultilingualTextWithSingleItem(
                        resourcesConnected.payload.text,
                        resourcesConnected.payload.languageCode
                    );

                expect(newConnectionForToMember.note.toDTO()).toEqual(expectedNote.toDTO());

                expect(newConnectionForToMember.id).toBe(
                    resourcesConnected.payload.aggregateCompositeIdentifier.id
                );

                // check the from member
                const updatedFromMember = (await testQueryRepository.fetchById(
                    existingWidgetViewForFromMember.id
                )) as WidgetViewModel;

                expect(updatedFromMember.connections).toHaveLength(1);

                const {
                    id: connectionId,
                    selfContext,
                    otherCompositeIdentifier,
                    otherContext,
                    note,
                } = updatedFromMember.connections[0];

                expect(selfContext).toEqual(generalContext);

                expect(otherContext).toEqual(generalContext);

                expect(note.toDTO()).toEqual(expectedNote.toDTO());

                expect(connectionId).toBe(
                    resourcesConnected.payload.aggregateCompositeIdentifier.id
                );

                expect(otherCompositeIdentifier).toEqual(
                    resourcesConnected.payload.toMemberCompositeIdentifier
                );
            });
        });

        describe(`when adding a second connection`, () => {
            it.todo(`should have a test`);
        });
    });
});
