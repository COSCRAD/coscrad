import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import buildTestData from '../../../../../test-data/buildTestData';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { Photograph } from '../../../photograph/entities/photograph.entity';
import { Resource } from '../../../resource.entity';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import UserAlreadyHasReadAccessError from '../../common-command-errors/invalid-state-transition-errors/UserAlreadyHasReadAccessError';
import { GrantResourceReadAccessToUser } from './grant-resource-read-access-to-user.command';

const commandType = 'GRANT_RESOURCE_READ_ACCESS_TO_USER';

const { user: users, resources } = buildTestData();

const userId = buildDummyUuid();

const existingUser = users[0].clone({ id: userId, authProviderUserId: `auth0|${userId}` });

const existingPhotograph = getValidAggregateInstanceForTest(AggregateType.photograph);

const initialState = buildInMemorySnapshot({
    user: [existingUser],
    resources,
});

const validFSA: FluxStandardAction<GrantResourceReadAccessToUser> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingPhotograph.getCompositeIdentifier(),
        userId: existingUser.id,
    },
};

const buildValidCommandFSA = () => validFSA;

const fsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

const dummyAdminUserId = buildDummyUuid();

describe('GRANT_RESOURCE_READ_ACCESS_TO_USER', () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    // TODO: add standalone test for these resources
    const eventSourcedResourceTypes = [
        ResourceType.song,
        ResourceType.digitalText,
        ResourceType.term,
        ResourceType.vocabularyList,
        ResourceType.playlist,
        ResourceType.audioItem,
        ResourceType.video,
    ];

    describe('when the command is valid', () => {
        Object.values(ResourceType)
            // TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced resources in this test
            .filter((rt) => !eventSourcedResourceTypes.includes(rt))
            .map(getValidAggregateInstanceForTest)

            .forEach((resource) => {
                describe(`when granting access to: ${formatAggregateCompositeIdentifier(
                    resource.getCompositeIdentifier()
                )}`, () => {
                    it('should succeed', async () => {
                        await assertCommandSuccess(commandAssertionDependencies, {
                            buildValidCommandFSA: () =>
                                fsaFactory.build(undefined, {
                                    aggregateCompositeIdentifier: resource.getCompositeIdentifier(),
                                }),
                            initialState,
                            systemUserId: dummyAdminUserId,
                            checkStateOnSuccess: async ({
                                aggregateCompositeIdentifier: { type, id },
                                userId,
                            }: GrantResourceReadAccessToUser) => {
                                const updatedResourceSearchResult = await testRepositoryProvider
                                    .forResource(type)
                                    .fetchById(id);

                                expect(updatedResourceSearchResult).not.toBe(NotFound);

                                expect(updatedResourceSearchResult).not.toBeInstanceOf(
                                    InternalError
                                );

                                const updatedResource = updatedResourceSearchResult as Resource;

                                expect(updatedResource.queryAccessControlList.canUser(userId)).toBe(
                                    true
                                );

                                assertEventRecordPersisted(
                                    updatedResource,
                                    'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
                                    dummyAdminUserId
                                );
                            },
                        });
                    });
                });
            });
    });

    describe('when the command is invalid', () => {
        describe('when there is no user with the given ID', () => {
            it('should fail', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: buildInMemorySnapshot({
                        // no users
                        resources,
                    }),
                    systemUserId: dummyAdminUserId,
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new AggregateNotFoundError({
                                type: AggregateType.user,
                                id: validFSA.payload.userId,
                            })
                        );
                    },
                });
            });
        });

        describe('when there is no resource with the given composite identifier', () => {
            it('should fail', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: buildInMemorySnapshot({
                        user: [existingUser],
                        // no resources
                    }),
                    systemUserId: dummyAdminUserId,
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new AggregateNotFoundError(
                                validFSA.payload.aggregateCompositeIdentifier
                            )
                        );
                    },
                });
            });
        });

        describe('when the user already has read access to the resource', () => {
            it('should fail', async () => {
                const existingPhotographWithAccessToResource =
                    existingPhotograph.grantReadAccessToUser(existingUser.id) as Photograph;

                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            aggregateCompositeIdentifier:
                                existingPhotograph.getCompositeIdentifier(),
                            userId: existingUser.id,
                        }),
                    systemUserId: dummyAdminUserId,
                    initialState: buildInMemorySnapshot({
                        user: [existingUser],
                        resources: {
                            photograph: [existingPhotographWithAccessToResource],
                        },
                    }),
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new UserAlreadyHasReadAccessError(
                                validFSA.payload.userId,
                                validFSA.payload.aggregateCompositeIdentifier
                            )
                        );
                    },
                });
            });
        });

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182840154]
         *
         * We should add fuzz test cases.
         *
         * see `validateCommandPayloadType.ts` for more info.
         */
    });
});
