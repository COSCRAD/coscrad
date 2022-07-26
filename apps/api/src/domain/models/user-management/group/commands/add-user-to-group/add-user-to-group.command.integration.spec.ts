import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError, isInternalError } from '../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../../../../test-data/buildTestData';
import { DTO } from '../../../../../../types/DTO';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { assertExternalStateError } from '../../../../__tests__/command-helpers/assert-external-state-error';
import { DummyCommandFSAFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';
import { UserDoesNotExistError } from '../../errors/external-state-errors/UserDoesNotExistError';
import { AddUserToGroup } from './add-user-to-group.command';
import { AddUserToGroupCommandHandler } from './add-user-to-group.command-handler';

const commandType = 'ADD_USER_TO_GROUP';

const userAlreadyInGroup = buildTestData().users[0].clone({
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc001',
});

const userToAdd = userAlreadyInGroup.clone({
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc003',
    username: 'al-b-added-2022',
    authProviderUserId: 'zauth|909878',
});

const existingGroup = buildTestData().userGroups[0].clone({
    userIds: [userAlreadyInGroup.id],
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc002',
});

const initialState = buildInMemorySnapshot({
    users: [userAlreadyInGroup, userToAdd],
    userGroups: [existingGroup],
});

const validCommandFSA = {
    type: commandType,
    payload: {
        groupId: existingGroup.id,
        userId: userToAdd.id,
    },
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddUserToGroup>> => validCommandFSA;

const buildInvalidFSA = (id, payloadOverrides) =>
    new DummyCommandFSAFactory(buildValidCommandFSA).build(id, payloadOverrides);

describe('AddUserToGroup', () => {
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
            new AddUserToGroupCommandHandler(testRepositoryProvider, idManager)
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
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState,
                checkStateOnSuccess: async ({ groupId, userId }: AddUserToGroup) => {
                    const groupSearchResult = await testRepositoryProvider
                        .getUserGroupRepository()
                        .fetchById(groupId);

                    if (isInternalError(groupSearchResult) || isNotFound(groupSearchResult)) {
                        throw new InternalError(
                            `After adding a user to the existing group: ${groupId}, the group could not be found`
                        );
                    }

                    const isUserInGroup = groupSearchResult.hasUser(userId);

                    expect(isUserInGroup).toBe(true);

                    assertEventRecordPersisted(
                        groupSearchResult as CoscradUserGroup,
                        'USER_ADDED_TO_GROUP',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when there is no user with the given userId', () => {
            it('should fail with the appropriate error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: buildInMemorySnapshot({
                        users: [userAlreadyInGroup],
                        userGroups: [existingGroup],
                    }),
                    checkError: (error: InternalError) => {
                        assertExternalStateError(
                            error,
                            new UserDoesNotExistError(validCommandFSA.payload.userId)
                        );
                    },
                });
            });
        });

        describe('when there is no group with the given groupId', () => {
            it('should fail with the appropriate error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: buildInMemorySnapshot({
                        users: [userToAdd, userAlreadyInGroup],
                        userGroups: [],
                    }),
                    checkError: (error: InternalError) => {
                        expect(error.innerErrors[0]).toEqual(
                            new AggregateNotFoundError(existingGroup.getCompositeIdentifier())
                        );
                    },
                });
            });
        });

        describe('when the user is already in the group', () => {
            it('should fail with the appropriate error', async () => {
                assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () =>
                        buildInvalidFSA(userAlreadyInGroup.id, { id: userAlreadyInGroup.id }),
                    initialState,
                });
            });
        });

        describe('when one of the properties on the command payload has an invalid type', () => {
            generateCommandFuzzTestCases(AddUserToGroup).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                validCommandFSA
                            );
                        });
                    });
                }
            );
        });
    });
});
