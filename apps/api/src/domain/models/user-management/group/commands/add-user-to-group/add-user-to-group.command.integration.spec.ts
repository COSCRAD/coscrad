import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError, isInternalError } from '../../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../../../../test-data/buildTestData';
import { DTO } from '../../../../../../types/DTO';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';
import { AddUserToGroup } from './add-user-to-group.command';

const commandType = 'ADD_USER_TO_GROUP';

const userAlreadyInGroup = buildTestData().user[0].clone({
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc001',
});

const userToAdd = userAlreadyInGroup.clone({
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc003',
    username: 'al-b-added-2022',
    authProviderUserId: 'zauth|909878',
});

const existingGroup = buildTestData().userGroup[0].clone({
    userIds: [userAlreadyInGroup.id],
    id: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc002',
});

const initialState = buildInMemorySnapshot({
    user: [userAlreadyInGroup, userToAdd],
    userGroup: [existingGroup],
});

const validCommandFSA = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id: existingGroup.id, type: AggregateType.userGroup },
        userId: userToAdd.id,
    },
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddUserToGroup>> => validCommandFSA;

const buildInvalidFSA = (id, payloadOverrides) =>
    new DummyCommandFsaFactory(buildValidCommandFSA).build(id, payloadOverrides);

describe('AddUserToGroup', () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
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

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: groupId },
                    userId,
                }: AddUserToGroup) => {
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
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                user: [userAlreadyInGroup],
                                userGroup: [existingGroup],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    checkError: (error: InternalError) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    existingGroup.getCompositeIdentifier(),
                                    [userToAdd.getCompositeIdentifier()]
                                ),
                            ])
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
                        user: [userToAdd, userAlreadyInGroup],
                        userGroup: [],
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
