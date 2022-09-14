import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { assertExternalStateError } from '../../../../../../domain/models/__tests__/command-helpers/assert-external-state-error';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../../../lib/types/not-available';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../../types/DTO';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import buildEmptyInMemorySnapshot from '../../../../../utilities/buildEmptyInMemorySnapshot';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import AggregateIdAlreadyInUseError from '../../../../shared/common-command-errors/AggregateIdAlreadyInUseError';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFSAFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';
import { UserGroupLabelAlreadyInUseError } from '../../errors/external-state-errors/UserGroupLabelAlreadyInUseError';
import { CreateGroup } from './create-group.command';
import { CreateGroupCommandHandler } from './create-group.command-handler';

const commandType = 'CREATE_USER_GROUP';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateGroup>> => ({
    type: commandType,

    payload: {
        id,
        label: 'teachers',
        description: 'this group is for teachers from community schools',
    },
});

const initialState = buildEmptyInMemorySnapshot();

const fsaFactory = new DummyCommandFSAFactory<CreateGroup>(buildValidCommandFSA);

const buildInvalidFSA = (id, payloadOverrides) => fsaFactory.build(id, payloadOverrides);

const existingUserGroupDto: DTO<CoscradUserGroup> = {
    type: AggregateType.userGroup,
    id: buildDummyUuid(),
    label: 'existing users',
    description: 'this group already exists before running the command',
    userIds: [],
};

const existingUserGroup = new CoscradUserGroup(existingUserGroupDto);

describe('CreateGroup', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                { shouldMockIdGenerator: true }
            ));

        commandHandlerService.registerHandler(
            commandType,
            new CreateGroupCommandHandler(testRepositoryProvider, idManager)
        );

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };

        jest.useFakeTimers().setSystemTime(new Date('2020-04-05'));
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
    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState,
                checkStateOnSuccess: async ({ id }: CreateGroup) => {
                    const userGroupSearchResult = await testRepositoryProvider
                        .getUserGroupRepository()
                        .fetchById(id);

                    expect(userGroupSearchResult).toBeInstanceOf(CoscradUserGroup);

                    // This allows us to visually  inspect the payload => new instance mapping
                    expect(userGroupSearchResult).toMatchSnapshot();

                    // Ensure the id has been marked as used
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    assertEventRecordPersisted(
                        userGroupSearchResult as CoscradUserGroup,
                        'USER_GROUP_CREATED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the new group ID was not generated with our system', () => {
            it('should return the expected error', async () => {
                await assertCreateCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, { id: buildDummyUuid() }),
                    initialState,
                });
            });
        });

        describe('when there is already a user group with the given ID', () => {
            it('should fail with the expected error', async () => {
                const newId = await idManager.generate();

                await testRepositoryProvider.addFullSnapshot(
                    buildInMemorySnapshot({
                        userGroup: [existingUserGroup.clone({ id: newId })],
                    })
                );

                const commandFSAThatReusesId = buildValidCommandFSA(newId);

                const executionResult = await commandHandlerService.execute(
                    commandFSAThatReusesId,
                    { userId: dummySystemUserId }
                );

                assertExternalStateError(
                    executionResult,
                    new AggregateIdAlreadyInUseError({ id: newId, type: AggregateType.userGroup })
                );
            });
        });

        describe('when there is already a user group with the given label', () => {
            it('should fail with the expected error', async () => {
                await assertCreateCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, { label: existingUserGroup.label }),
                    initialState: buildInMemorySnapshot({
                        userGroup: [existingUserGroup],
                    }),
                    checkError: (error: InternalError) =>
                        assertExternalStateError(
                            error,
                            new UserGroupLabelAlreadyInUseError(existingUserGroup.label)
                        ),
                });
            });
        });

        describe('when the payload has a property with an invalid type', () => {
            generateCommandFuzzTestCases(CreateGroup).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA('unused-id')
                            );
                        });
                    });
                }
            );
        });
    });
});
