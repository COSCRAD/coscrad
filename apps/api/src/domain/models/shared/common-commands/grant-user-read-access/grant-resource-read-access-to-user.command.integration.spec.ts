import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../../../test-data/buildTestData';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import getValidAggregateInstanceForTest from '../../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { ResourceType } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { Resource } from '../../../resource.entity';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import UserAlreadyHasReadAccessError from '../../common-command-errors/invalid-state-transition-errors/UserAlreadyHasReadAccessError';
import { GrantResourceReadAccessToUser } from './grant-resource-read-access-to-user.command';
import { GrantResourceReadAccessToUserCommandHandler } from './grant-resource-read-access-to-user.command-handler';

const commandType = 'GRANT_RESOURCE_READ_ACCESS_TO_USER';

const { user: users, resources } = buildTestData();

const existingUser = users[0].clone({ id: buildDummyUuid() });

const existingBook = resources.book[0];

const initialState = buildInMemorySnapshot({
    user: [existingUser],
    resources,
});

const validFSA: FluxStandardAction<GrantResourceReadAccessToUser> = {
    type: commandType,
    payload: {
        userId: existingUser.id,
        resourceCompositeIdentifier: existingBook.getCompositeIdentifier(),
    },
};

const buildValidCommandFSA = () => validFSA;

const fsaFactory = new DummyCommandFSAFactory(buildValidCommandFSA);

const dummyAdminUserId = buildDummyUuid();

describe('GrantResourceReadAccesstoUser', () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({
            testRepositoryProvider,
            commandHandlerService,
            idManager,
            arangoConnectionProvider,
            app,
        } = await setUpIntegrationTest({
            ARANGO_DB_NAME: generateRandomTestDatabaseName(),
        }).catch((error) => {
            throw error;
        }));

        commandHandlerService.registerHandler(
            commandType,
            new GrantResourceReadAccessToUserCommandHandler(testRepositoryProvider, idManager)
        );

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();

        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command is valid', () => {
        Object.values(ResourceType)
            .map(getValidAggregateInstanceForTest)

            .forEach((resource) => {
                describe(`when granting access to: ${formatAggregateCompositeIdentifier(
                    resource.getCompositeIdentifier()
                )}`, () => {
                    it('should succeed', async () => {
                        await assertCommandSuccess(commandAssertionDependencies, {
                            buildValidCommandFSA: () =>
                                fsaFactory.build(undefined, {
                                    resourceCompositeIdentifier: resource.getCompositeIdentifier(),
                                }),
                            initialState,
                            systemUserId: dummyAdminUserId,
                            checkStateOnSuccess: async ({
                                userId,
                                resourceCompositeIdentifier: { type, id },
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
                            new AggregateNotFoundError(validFSA.payload.resourceCompositeIdentifier)
                        );
                    },
                });
            });
        });

        describe('when the user already has read access to the resource', () => {
            it('should fail', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: buildValidCommandFSA,
                    systemUserId: dummyAdminUserId,
                    initialState: buildInMemorySnapshot({
                        user: [existingUser],
                        resources: {
                            book: [
                                existingBook.clone({
                                    queryAccessControlList:
                                        existingBook.queryAccessControlList.allowUser(
                                            validFSA.payload.userId
                                        ),
                                }),
                            ],
                        },
                    }),
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new UserAlreadyHasReadAccessError(
                                validFSA.payload.userId,
                                validFSA.payload.resourceCompositeIdentifier
                            )
                        );
                    },
                });
            });
        });

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182840154]
         *
         * We should add fuzz test cases- but this will cause problems currently
         * because of the composite identifier decorator not playing nice
         * with class-validator's "forbidUnknownProps" validation.
         *
         * see `validateCommandPayloadType.ts` for more info.
         */
    });
});
