import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
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
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { EdgeAlreadyPublishedError } from '../../errors';
import { PublishEdge } from './publish-edge.command';

const commandType = 'PUBLISH_EDGE';

const targetEdgeId = buildDummyUuid(88);

const buildValidCommandFSA = () => ({
    type: commandType,
    payload: buildTestInstance(PublishEdge, {
        aggregateCompositeIdentifier: {
            id: targetEdgeId,
        },
    }),
});

const unpublishedNote = buildTestInstance(EdgeConnection, {
    id: targetEdgeId,
    isPublished: false,
    connectionType: EdgeConnectionType.self,
    members: [
        buildTestInstance(EdgeConnectionMember, {
            role: EdgeConnectionMemberRole.self,
        }),
    ],
});

const unpublishedConnection = buildTestInstance(EdgeConnection, {
    id: targetEdgeId,
    isPublished: false,
    connectionType: EdgeConnectionType.dual,
    members: [
        buildTestInstance(EdgeConnectionMember, {
            role: EdgeConnectionMemberRole.from,
            compositeIdentifier: {
                type: AggregateType.song,
                id: buildDummyUuid(203),
            },
        }),
        buildTestInstance(EdgeConnectionMember, {
            role: EdgeConnectionMemberRole.to,
            compositeIdentifier: {
                type: AggregateType.term,
                id: buildDummyUuid(303),
            },
        }),
    ],
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
        }).compile();

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
                    await assertCommandError(
                        {
                            testRepositoryProvider,
                            commandHandlerService,
                        },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider.getEdgeConnectionRepository().create(
                                    unpublishedNote.publish() as EdgeConnection // this will succeed
                                );
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
                    await assertCommandError(
                        {
                            testRepositoryProvider,
                            commandHandlerService,
                        },
                        {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await testRepositoryProvider.getEdgeConnectionRepository().create(
                                    unpublishedConnection.publish() as EdgeConnection // this will succeed
                                );
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
