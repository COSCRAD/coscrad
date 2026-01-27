import { AggregateType, EdgeConnectionContextType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../../../validation';
import { CoscradEventFactory } from '../../../../common';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { EdgeConnection } from '../../edge-connection.entity';
import { EdgeAlreadyPublishedError } from '../../errors';
import { ResourcesConnectedWithNote } from '../connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from '../create-note-about-resource/note-about-resource-created.event';
import { PublishEdge } from './publish-edge.command';

const commandType = 'PUBLISH_EDGE';

const targetEdgeId = buildDummyUuid(88);

const generalContext = {
    type: EdgeConnectionContextType.general,
};

const buildValidCommandFSA = () => ({
    type: commandType,
    payload: buildTestInstance(PublishEdge, {
        aggregateCompositeIdentifier: {
            id: targetEdgeId,
        },
    }),
});

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
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
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        testRepositoryProvider = new TestRepositoryProvider(
            app.get(ArangoDatabaseProvider),
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        commandHandlerService = app.get(CommandHandlerService);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        app.get(ArangoDatabaseProvider).close();

        app.close();
    });

    describe(`when the command is valid`, () => {
        describe(`when a (self) note is being published`, () => {
            it(`should publish the note`, async () => {
                const eventHistoryForNote = [
                    buildTestInstance(NoteAboutResourceCreated, {
                        payload: {
                            aggregateCompositeIdentifier: {
                                id: targetEdgeId,
                            },
                            resourceContext: generalContext,
                        },
                    }),
                ];

                const unpublishedNote = EdgeConnection.fromEventHistory(
                    eventHistoryForNote,
                    targetEdgeId
                ) as EdgeConnection;

                await assertCommandSuccess(
                    { testRepositoryProvider, commandHandlerService },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .create(unpublishedNote);
                        },
                        buildValidCommandFSA,
                        checkStateOnSuccess: async () => {
                            const updatedEdge = (await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .fetchById(targetEdgeId)) as EdgeConnection;

                            expect(updatedEdge.isPublished).toBe(true);

                            assertEventRecordPersisted(
                                updatedEdge,
                                'EDGE_PUBLISHED',
                                dummySystemUserId
                            );
                        },
                    }
                );
            });
        });

        describe(`when a connection (edge connection) is being published`, () => {
            it(`should publish the connection`, async () => {
                const unpublishedConnection = EdgeConnection.fromEventHistory(
                    [
                        buildTestInstance(ResourcesConnectedWithNote, {
                            payload: {
                                aggregateCompositeIdentifier: {
                                    id: targetEdgeId,
                                },
                                toMemberContext: generalContext,
                                fromMemberContext: generalContext,
                            },
                        }),
                    ],
                    targetEdgeId
                ) as EdgeConnection;

                await assertCommandSuccess(
                    { testRepositoryProvider, commandHandlerService },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .create(unpublishedConnection);
                        },
                        buildValidCommandFSA: () => ({
                            type: commandType,
                            payload: buildTestInstance(PublishEdge, {
                                aggregateCompositeIdentifier: {
                                    id: targetEdgeId,
                                },
                            }),
                        }),
                        checkStateOnSuccess: async () => {
                            const updatedEdge = (await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .fetchById(targetEdgeId)) as EdgeConnection;

                            expect(updatedEdge.isPublished).toBe(true);

                            assertEventRecordPersisted(
                                updatedEdge,
                                'EDGE_PUBLISHED',
                                dummySystemUserId
                            );
                        },
                    }
                );
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the edge does not exist`, () => {
            const missingEdgeId = buildDummyUuid(404);
            it(`should fail with the expected error`, async () => {
                await assertCommandError(
                    {
                        testRepositoryProvider,
                        commandHandlerService,
                    },
                    {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            // DB is empty
                            return Promise.resolve();
                        },
                        buildCommandFSA: () => ({
                            type: commandType,
                            payload: buildTestInstance(PublishEdge, {
                                aggregateCompositeIdentifier: {
                                    id: missingEdgeId,
                                },
                            }),
                        }),
                        checkError: (error) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new AggregateNotFoundError({
                                        type: AggregateType.note,
                                        id: missingEdgeId,
                                    }),
                                ])
                            );
                        },
                    }
                );
            });
        });

        describe(`when the edge is already published`, () => {
            describe(`when the edge is a note`, () => {
                it(`should return the expected error`, async () => {
                    const eventHistoryForNote = [
                        buildTestInstance(NoteAboutResourceCreated, {
                            payload: {
                                aggregateCompositeIdentifier: {
                                    id: targetEdgeId,
                                },
                                resourceContext: generalContext,
                            },
                        }),
                    ];

                    const unpublishedNote = EdgeConnection.fromEventHistory(
                        eventHistoryForNote,
                        targetEdgeId
                    ) as EdgeConnection;

                    await assertCommandSuccess(
                        { testRepositoryProvider, commandHandlerService },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider
                                    .getEdgeConnectionRepository()
                                    .create(unpublishedNote);
                            },
                            buildValidCommandFSA,
                            checkStateOnSuccess: async () => {
                                const updatedEdge = (await testRepositoryProvider
                                    .getEdgeConnectionRepository()
                                    .fetchById(targetEdgeId)) as EdgeConnection;

                                expect(updatedEdge.isPublished).toBe(true);

                                assertEventRecordPersisted(
                                    updatedEdge,
                                    'EDGE_PUBLISHED',
                                    dummySystemUserId
                                );
                            },
                        }
                    );

                    await assertCommandError(
                        {
                            testRepositoryProvider,
                            commandHandlerService,
                        },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                Promise.resolve();
                            },
                            buildCommandFSA: buildValidCommandFSA,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new EdgeAlreadyPublishedError(targetEdgeId),
                                    ])
                                );
                            },
                        }
                    );
                });
            });

            describe(`when the edge is a connection`, () => {
                it(`should return the expected error`, async () => {
                    const unpublishedConnection = EdgeConnection.fromEventHistory(
                        [
                            buildTestInstance(ResourcesConnectedWithNote, {
                                payload: {
                                    aggregateCompositeIdentifier: {
                                        id: targetEdgeId,
                                    },
                                    toMemberContext: generalContext,
                                    fromMemberContext: generalContext,
                                },
                            }),
                        ],
                        targetEdgeId
                    ) as EdgeConnection;

                    await assertCommandSuccess(
                        { testRepositoryProvider, commandHandlerService },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider
                                    .getEdgeConnectionRepository()
                                    .create(unpublishedConnection);
                            },
                            buildValidCommandFSA: () => ({
                                type: commandType,
                                payload: buildTestInstance(PublishEdge, {
                                    aggregateCompositeIdentifier: {
                                        id: targetEdgeId,
                                    },
                                }),
                            }),
                            checkStateOnSuccess: async () => {
                                const updatedEdge = (await testRepositoryProvider
                                    .getEdgeConnectionRepository()
                                    .fetchById(targetEdgeId)) as EdgeConnection;

                                expect(updatedEdge.isPublished).toBe(true);

                                assertEventRecordPersisted(
                                    updatedEdge,
                                    'EDGE_PUBLISHED',
                                    dummySystemUserId
                                );
                            },
                        }
                    );

                    await assertCommandError(
                        {
                            testRepositoryProvider,
                            commandHandlerService,
                        },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                Promise.resolve();
                            },
                            buildCommandFSA: buildValidCommandFSA,
                            checkError: (error) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new EdgeAlreadyPublishedError(targetEdgeId),
                                    ])
                                );
                            },
                        }
                    );
                });
            });
        });
    });
});
