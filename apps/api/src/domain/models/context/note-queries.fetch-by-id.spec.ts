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
import { buildTestInstance, CoscradDataExample } from '../.../../../../test-data/utilities';
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
import { DeepPartial } from '../../../types/DeepPartial';
import { DTO } from '../../../types/DTO';
import { AggregateId } from '../../types/AggregateId';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { CoscradUserWithGroups } from '../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';
import { IResourceConnectionDto } from './commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { EventSourcedNoteViewModel } from './note.view-model.event-sourced';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from './repositories/note-query-repository.interface';

const userId = buildDummyUuid(125);

const buildDetailEndpoint = (id: AggregateId) => `/webOfKnowledge/${id}`;

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
                    original: {
                        text: text.items[0].text,
                        languageCode: text.items[0].languageCode,
                    },
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

const noteAboutWidget = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(101),
    connectionType: EdgeConnectionType.self,
    connectedResources: {
        self: {
            resource: fromMemberWidget.getCompositeIdentifier(),
            context: generalContext,
        },
    },
});

const toMemberWidget = buildTestInstance(WidgetViewModel, {
    id: buildDummyUuid(105),
    name: 'widget for the to member',
});

const noteConnectingWidgets = buildTestInstance(EventSourcedNoteViewModel, {
    id: buildDummyUuid(101),
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

describe(`when querying for a note: fetch by Id`, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let noteQueryRepository: INoteQueryRepository;

    let widgetQueryRepository: WidgetQueryRepository;

    const setItUp = async (userWithGroups?: CoscradUserWithGroups) => {
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
            .useValue(new MockJwtAuthGuard(userWithGroups, true))
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
    };

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await databaseProvider.getDatabaseForCollection(WIDGET_COLLECTION).clear();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            // no user on the request
            await setItUp();
        });

        describe(`when the note is public`, () => {
            describe(`when there is a note with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteAboutWidget.id);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    // TODO Do we want to format multilingual text as a lookup table by language code here?
                    expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                });
            });

            describe(`when there is a connection with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteConnectingWidgets.id);
                });

                it(`should return the expected result`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(noteAboutWidget.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteConnectingWidgets.text.items);
                });
            });
        });

        describe(`when the edge is not published`, () => {
            describe(`when searching for an unpublished note`, () => {
                describe(`when there is a note with the given ID`, () => {
                    beforeEach(async () => {
                        await widgetQueryRepository.create(fromMemberWidget);

                        await noteQueryRepository.createNoteAbout(
                            noteAboutWidget,
                            fromMemberWidget.getCompositeIdentifier(),
                            generalContext
                        );
                    });

                    it(`should return not found`, async () => {
                        const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                        const res = await request(app.getHttpServer()).get(endpoint);

                        expect(res.status).toBe(HttpStatusCode.notFound);
                    });
                });
            });
        });

        describe(`when the note does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(404))
                );

                expect(res.status).toBe(HttpStatusCode.notFound);
            });
        });
    });

    describe(`when the user is an ordinary user (viewer)`, () => {
        beforeAll(async () => {
            const ordinaryUser = buildTestInstance(CoscradUser, {
                id: userId,
                roles: [CoscradUserRole.viewer],
            });

            await setItUp(new CoscradUserWithGroups(ordinaryUser, []));
        });

        describe(`when the note is public`, () => {
            describe(`when there is a note with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteAboutWidget.id);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                });
            });

            describe(`when there is a connection with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteConnectingWidgets.id);
                });

                it(`should return the expected result`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(noteAboutWidget.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteConnectingWidgets.text.items);
                });
            });
        });

        describe(`when the note or connection is private`, () => {
            describe(`when the user does not have ACL based read access`, () => {
                describe(`when searching for an unpublished note`, () => {
                    describe(`when there is a note with the given ID`, () => {
                        beforeEach(async () => {
                            await widgetQueryRepository.create(fromMemberWidget);

                            await noteQueryRepository.createNoteAbout(
                                noteAboutWidget,
                                fromMemberWidget.getCompositeIdentifier(),
                                generalContext
                            );
                        });

                        it(`should return not found`, async () => {
                            const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                            const res = await request(app.getHttpServer()).get(endpoint);

                            expect(res.status).toBe(HttpStatusCode.notFound);
                        });
                    });
                });
            });

            describe(`when the user has ACL based read access`, () => {
                describe(`when searching for a simple note`, () => {
                    beforeEach(async () => {
                        await widgetQueryRepository.create(fromMemberWidget);

                        await noteQueryRepository.createNoteAbout(
                            noteAboutWidget,
                            fromMemberWidget.getCompositeIdentifier(),
                            generalContext
                        );

                        await noteQueryRepository.allowUser(noteAboutWidget.id, userId);
                    });

                    it(`should return the expected result`, async () => {
                        const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                        const res = await request(app.getHttpServer()).get(endpoint);

                        expect(res.status).toBe(HttpStatusCode.ok);

                        expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                    });
                });
            });
        });

        describe(`when the note does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(404))
                );

                expect(res.status).toBe(HttpStatusCode.notFound);
            });
        });
    });

    describe(`when the user is a system (COSCRAD) admin`, () => {
        beforeAll(async () => {
            const coscradAdminUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.superAdmin],
            });

            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        describe(`when the note is public`, () => {
            describe(`when there is a note with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteAboutWidget.id);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                });
            });

            describe(`when there is a connection with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteConnectingWidgets.id);
                });

                it(`should return the expected result`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(noteAboutWidget.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteConnectingWidgets.text.items);
                });
            });
        });

        /**
         * TODO What about when one of the resources is not published?
         */
        describe(`when the edge is not published`, () => {
            describe(`when searching for an unpublished note`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );
                });

                it(`should return the note`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body).toMatchSnapshot();
                });
            });

            describe(`when searching for an unpublished connection`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );
                });

                it(`should return the connection`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body).toMatchSnapshot();
                });
            });
        });

        describe(`when the edge does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(404))
                );

                expect(res.status).toBe(HttpStatusCode.notFound);
            });
        });
    });

    describe(`when the user is a project admin`, () => {
        beforeAll(async () => {
            const coscradAdminUser = buildTestInstance(CoscradUser, {
                roles: [CoscradUserRole.projectAdmin],
            });

            await setItUp(new CoscradUserWithGroups(coscradAdminUser, []));
        });

        describe(`when the note is public`, () => {
            describe(`when there is a note with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteAboutWidget.id);
                });

                it(`should find it`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                });
            });

            describe(`when there is a connection with the given ID`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );

                    await noteQueryRepository.publish(noteConnectingWidgets.id);
                });

                it(`should return the expected result`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(noteAboutWidget.id)
                    );

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteConnectingWidgets.text.items);
                });
            });
        });

        /**
         * TODO What about when one of the resources is not published?
         */
        describe(`when the edge is not published`, () => {
            describe(`when searching for an unpublished note`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await noteQueryRepository.createNoteAbout(
                        noteAboutWidget,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );
                });

                it(`should return the note`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteAboutWidget.text.items);
                });
            });

            describe(`when searching for an unpublished connection`, () => {
                beforeEach(async () => {
                    await widgetQueryRepository.create(fromMemberWidget);

                    await widgetQueryRepository.create(toMemberWidget);

                    await noteQueryRepository.connectResourcesWithNote(
                        noteConnectingWidgets,
                        fromMemberWidget.getCompositeIdentifier(),
                        generalContext,
                        toMemberWidget.getCompositeIdentifier(),
                        generalContext
                    );
                });

                it(`should return the connection`, async () => {
                    const endpoint = buildDetailEndpoint(noteAboutWidget.id);

                    const res = await request(app.getHttpServer()).get(endpoint);

                    expect(res.status).toBe(HttpStatusCode.ok);

                    expect(res.body.text.items).toEqual(noteConnectingWidgets.text.items);
                });
            });
        });

        describe(`when the edge does not exist`, () => {
            it(`should return not found`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(404))
                );

                expect(res.status).toBe(HttpStatusCode.notFound);
            });
        });
    });
});
