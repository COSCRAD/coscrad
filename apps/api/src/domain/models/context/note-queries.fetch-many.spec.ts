import {
    EdgeConnectionContextType,
    EdgeConnectionType,
    HttpStatusCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/environment';
import { EdgeConnectionModule } from '../../../app/domain-modules/edge-connection.module';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ConnectionRecordForResourceViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import { NoteRecordForResourceViewModel } from '../../../queries/buildViewModelForResource/viewModels/note-record-for-resource.view-model';
import { buildTestInstance, CoscradDataExample } from '../../../test-data/utilities';
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { IResourceConnectionDto } from './commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { EventSourcedNoteViewModel } from './note.view-model.event-sourced';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from './repositories/note-query-repository.interface';

const indexEndpoint = `/webOfKnowledge`;

const WIDGET_COLLECTION = 'widget__VIEWS';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

@CoscradDataExample<WidgetViewModel>({
    example: {
        id: buildDummyUuid(3),
        connections: [],
        notes: [],
        type: WIDGET_RESOURCE_TYPE,
        name: 'my widget',
    },
})
class WidgetViewModel {
    id: string;
    readonly type = WIDGET_RESOURCE_TYPE;
    name: string;
    connections: ConnectionRecordForResourceViewModel[];
    notes: NoteRecordForResourceViewModel[];

    constructor({ id, connections, notes, name }: DTO<WidgetViewModel>) {
        this.id = id;

        this.connections = connections.map((dto) =>
            ConnectionRecordForResourceViewModel.fromDto(dto)
        );

        this.notes = notes.map((dto) => NoteRecordForResourceViewModel.fromDto(dto));

        this.name = name;
    }

    getCompositeIdentifier() {
        return { type: this.type, id: this.id } as const;
    }

    static fromDto(dto: DTO<WidgetViewModel>) {
        return new WidgetViewModel(dto);
    }
}

class WidgetQueryRepository {
    private readonly arangoDb: ArangoDatabaseForCollection<WidgetViewModel>;

    constructor(connectionProvider: ArangoConnectionProvider) {
        this.arangoDb = new ArangoDatabaseForCollection(
            new ArangoDatabase(connectionProvider.getConnection()),
            WIDGET_COLLECTION
        );
    }

    async fetchById(id: string): Promise<Maybe<WidgetViewModel>> {
        const searchResult = await this.arangoDb.fetchById(id);

        if (isNotFound(searchResult)) {
            return searchResult;
        }

        return new WidgetViewModel(mapDatabaseDocumentToAggregateDTO(searchResult));
    }

    async create(w: WidgetViewModel): Promise<void> {
        await this.arangoDb.create(mapEntityDTOToDatabaseDocument(w));
    }

    async update(id: AggregateId, w: DeepPartial<DTO<WidgetViewModel>>): Promise<void> {
        await this.arangoDb.update(id, w);
    }

    async createConnection(
        id: string,
        {
            noteId,
            otherCompositeIdentifier: compositeIdentifier,
            selfContext,
            otherContext,
            text,
            role,
        }: IResourceConnectionDto
    ): Promise<void> {
        const targetWidget = await this.fetchById(id);

        if (isNotFound(targetWidget)) return;

        targetWidget.connections.push(
            ConnectionRecordForResourceViewModel.fromDto({
                id: noteId,
                selfContext,
                otherCompositeIdentifier: compositeIdentifier,
                otherContext,
                note: {
                    original: text.items[0],
                    translations: {},
                },
                role,
            })
        );

        await this.update(id, targetWidget);
    }
}

const generalContext = { type: EdgeConnectionContextType.general };

const fromMemberWidget = buildTestInstance(WidgetViewModel, {
    id: buildDummyUuid(5),
    name: 'widget for the from member',
    // TODO decide what to do with this
    notes: [],
});

const toMemberWidget = buildTestInstance(WidgetViewModel, {
    id: buildDummyUuid(6),
    name: 'widget for the to member',
});

const noteAboutWidget = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(101),
    connectionType: EdgeConnectionType.self,
    connectedResources: {
        self: {
            resource: fromMemberWidget.getCompositeIdentifier(),
        },
    },
});

const noteConnectingWidgets = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(102),
    connectionType: EdgeConnectionType.dual,
    connectedResources: {
        from: {
            resource: fromMemberWidget.getCompositeIdentifier(),
            context: generalContext,
        },
        to: {
            resource: toMemberWidget.getCompositeIdentifier(),
            context: generalContext,
        },
    },
});

describe(`when querying for a note: fetch many`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let noteQueryRepository: INoteQueryRepository;

    let widgetQueryRepository: WidgetQueryRepository;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),

                PersistenceModule.forRootAsync(),
                EdgeConnectionModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                        NODE_PORT: 1234,
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        widgetQueryRepository = new WidgetQueryRepository(connectionProvider);

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);

        widgetQueryRepository = new WidgetQueryRepository(connectionProvider);

        noteQueryRepository = app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN);

        // this is important!
        await app.init();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        // TODO support user access control for notes
        describe(`when there is a note with the given ID`, () => {
            beforeEach(async () => {
                await widgetQueryRepository.create(fromMemberWidget);

                await widgetQueryRepository.create(toMemberWidget);

                await noteQueryRepository.createNoteAbout(
                    noteAboutWidget,
                    fromMemberWidget.getCompositeIdentifier(),
                    generalContext
                );

                await noteQueryRepository.connectResourcesWithNote(
                    noteConnectingWidgets,
                    fromMemberWidget.getCompositeIdentifier(),
                    generalContext,
                    toMemberWidget.getCompositeIdentifier(),
                    generalContext
                );
            });

            it(`should return the available notes`, async () => {
                const res = await request(app.getHttpServer()).post(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                expect(res.body.entities).toHaveLength(2);

                expect(res.body).toMatchSnapshot();
            });
        });
    });
});
