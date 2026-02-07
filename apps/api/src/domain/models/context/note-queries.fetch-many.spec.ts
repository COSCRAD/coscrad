import {
    CoscradUserRole,
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
import { MockJwtAuthGuard } from '../../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
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
import { AccessControlList } from '../shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';
import { IResourceConnectionDto } from './commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { EventSourcedNoteViewModel } from './note.view-model.event-sourced';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from './repositories/note-query-repository.interface';

const indexEndpoint = `/webOfKnowledge`;

const WIDGET_COLLECTION = 'widget__VIEWS';

const WIDGET_RESOURCE_TYPE = 'widget' as ResourceType;

const userId = buildDummyUuid(101);

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

/**
 * WARNING Not all properties in the following view models are actually
 * used. We manually call `publish` and `grantAccess` in the repository.
 * This is because the creation API for the `INoteQueryRepository` does not
 * allow one to create a published note or a note with a non-empty ACL.
 */
const publicNoteAboutWidget = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(101),
    connectionType: EdgeConnectionType.self,
    connectedResources: {
        self: {
            resource: fromMemberWidget.getCompositeIdentifier(),
        },
    },
});

const privateNoteAboutWidget = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(102),
    isPublished: false,
    connectionType: EdgeConnectionType.self,
    connectedResources: {
        self: {
            resource: fromMemberWidget.getCompositeIdentifier(),
        },
    },
});

const privateNoteAboutWidgetThatOrinaryUserCanAccess = buildTestInstance(
    EventSourcedNoteViewModel,
    {
        id: buildDummyUuid(103),
        isPublished: false,
        accessControlList: new AccessControlList().allowUser(userId),
        connectionType: EdgeConnectionType.self,
        connectedResources: {
            self: {
                resource: fromMemberWidget.getCompositeIdentifier(),
            },
        },
    }
);

const publicNoteConnectingWidgets = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(104),
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

const privateNoteConnectingWidgets = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(105),
    isPublished: false,
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

const privateNoteConnectingWidgetsWithUserAccess = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(106),
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(userId),
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

    const setItUp = async (user: CoscradUserWithGroups) => {
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
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(user, true))
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        widgetQueryRepository = new WidgetQueryRepository(connectionProvider);

        await connectionProvider.createCollectionIfNotExists(WIDGET_COLLECTION);

        widgetQueryRepository = new WidgetQueryRepository(connectionProvider);

        noteQueryRepository = app.get(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN);

        await app.init();
    };

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();

        await widgetQueryRepository.create(fromMemberWidget);

        await widgetQueryRepository.create(toMemberWidget);

        // public simple note
        await noteQueryRepository.createNoteAbout(
            publicNoteAboutWidget,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext
        );

        await noteQueryRepository.publish(publicNoteAboutWidget.id);

        // fully private simple note
        await noteQueryRepository.createNoteAbout(
            privateNoteAboutWidget,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext
        );

        // private simple note with user in query ACL
        await noteQueryRepository.createNoteAbout(
            privateNoteAboutWidgetThatOrinaryUserCanAccess,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext
        );

        await noteQueryRepository.allowUser(
            privateNoteAboutWidgetThatOrinaryUserCanAccess.id,
            userId
        );

        // public connecting note
        await noteQueryRepository.connectResourcesWithNote(
            publicNoteConnectingWidgets,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext,
            toMemberWidget.getCompositeIdentifier(),
            generalContext
        );

        await noteQueryRepository.publish(publicNoteConnectingWidgets.id);

        // private connection with user in ACL
        await noteQueryRepository.connectResourcesWithNote(
            privateNoteConnectingWidgetsWithUserAccess,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext,
            toMemberWidget.getCompositeIdentifier(),
            generalContext
        );

        await noteQueryRepository.allowUser(privateNoteConnectingWidgetsWithUserAccess.id, userId);

        // fully private connection
        await noteQueryRepository.connectResourcesWithNote(
            privateNoteConnectingWidgets,
            fromMemberWidget.getCompositeIdentifier(),
            generalContext,
            toMemberWidget.getCompositeIdentifier(),
            generalContext
        );
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user unauthenticated (public request)`, () => {
        beforeAll(async () => {
            // no user
            await setItUp(undefined);
        });

        describe(`when some edges are published and some are not`, () => {
            it(`should return only the published edges`, async () => {
                const res = await request(app.getHttpServer()).post(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                expect(res.body.entities).toHaveLength(2);

                const foundIds = res.body.entities.map(({ id }) => id);

                expect(foundIds).toContain(publicNoteAboutWidget.id);
                expect(foundIds).toContain(publicNoteConnectingWidgets.id);

                // a public user should not see edges that are not flagged as published
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        beforeAll(async () => {
            const viewer = buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.viewer],
            });

            await setItUp(new CoscradUserWithGroups(viewer, []));
        });

        describe(`when some edges are published and some are not`, () => {
            it(`should return only the published edges and edges for which the user is in the query ACL`, async () => {
                const res = await request(app.getHttpServer()).post(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                expect(res.body.entities).toHaveLength(4);

                const foundIds = res.body.entities.map(({ id }) => id);

                expect(foundIds).toContain(publicNoteAboutWidget.id);
                expect(foundIds).toContain(publicNoteConnectingWidgets.id);
                expect(foundIds).toContain(privateNoteAboutWidgetThatOrinaryUserCanAccess.id);
                expect(foundIds).toContain(privateNoteConnectingWidgetsWithUserAccess.id);

                // this user should not see the private notes \ connections with an empty ACL
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        beforeAll(async () => {
            const projectAdmin = buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.projectAdmin],
            });

            await setItUp(new CoscradUserWithGroups(projectAdmin, []));
        });

        describe(`when some edges are published and some are not`, () => {
            it(`should return only the published edges and edges for which the user is in the query ACL`, async () => {
                const res = await request(app.getHttpServer()).post(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                expect(res.body.entities).toHaveLength(6);

                const foundIds = res.body.entities.map(({ id }) => id);

                expect(foundIds).toContain(publicNoteAboutWidget.id);
                expect(foundIds).toContain(publicNoteConnectingWidgets.id);
                expect(foundIds).toContain(privateNoteAboutWidgetThatOrinaryUserCanAccess.id);
                expect(foundIds).toContain(privateNoteConnectingWidgetsWithUserAccess.id);
                expect(foundIds).toContain(privateNoteAboutWidget.id);
                expect(foundIds).toContain(privateNoteConnectingWidgets.id);

                // this user should not see the private notes \ connections with an empty ACL
            });
        });
    });

    describe(`when the user is a system (COSCRAD) admin`, () => {
        beforeAll(async () => {
            const superAdmin = buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(superAdmin, []));
        });

        describe(`when some edges are published and some are not`, () => {
            it(`should return only the published edges and edges for which the user is in the query ACL`, async () => {
                const res = await request(app.getHttpServer()).post(indexEndpoint);

                expect(res.status).toBe(HttpStatusCode.createdResource);

                expect(res.body.entities).toHaveLength(6);

                const foundIds = res.body.entities.map(({ id }) => id);

                expect(foundIds).toContain(publicNoteAboutWidget.id);
                expect(foundIds).toContain(publicNoteConnectingWidgets.id);
                expect(foundIds).toContain(privateNoteAboutWidgetThatOrinaryUserCanAccess.id);
                expect(foundIds).toContain(privateNoteConnectingWidgetsWithUserAccess.id);
                expect(foundIds).toContain(privateNoteAboutWidget.id);
                expect(foundIds).toContain(privateNoteConnectingWidgets.id);

                // this user should not see the private notes \ connections with an empty ACL
            });
        });
    });
});
