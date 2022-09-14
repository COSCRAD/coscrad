import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole, FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { assertExternalStateError } from '../../../../../../domain/models/__tests__/command-helpers/assert-external-state-error';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../../types/DTO';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import buildEmptyInMemorySnapshot from '../../../../../utilities/buildEmptyInMemorySnapshot';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { assertCommandPayloadTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { InvalidFSAFactoryFunction } from '../../../../__tests__/command-helpers/types/InvalidFSAFactoryFunction';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { CoscradUserProfile } from '../../entities/user/coscrad-user-profile.entity';
import { CoscradUser } from '../../entities/user/coscrad-user.entity';
import { FullName } from '../../entities/user/full-name.entity';
import { RegisterUser } from './register-user.command';
import { RegisterUserCommandHandler } from './register-user.command-handler';

const commandType = 'REGISTER_USER';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<RegisterUser>> => ({
    type: commandType,
    payload: {
        id,
        userIdFromAuthProvider: 'prov|847686859040',
        username: 'jb823',
    },
});

const existingUserDto: DTO<CoscradUser> = {
    type: AggregateType.user,
    id: buildDummyUuid(),
    username: 'pdrp123',
    authProviderUserId: 'bauth|56874858',
    roles: [CoscradUserRole.viewer],
    profile: new CoscradUserProfile({
        email: 'pdrp@gmail.com',
        name: new FullName({
            firstName: 'Pete',
            lastName: 'DeRepeat',
        }),
    }),
};

const existingUser = new CoscradUser(existingUserDto);

const buildInvalidFSA: InvalidFSAFactoryFunction<RegisterUser> = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof RegisterUser, unknown>> = {}
): FluxStandardAction<DTO<RegisterUser>> => ({
    type: commandType,
    payload: {
        ...buildValidCommandFSA(id).payload,
        ...(payloadOverrides as Partial<RegisterUser>),
    },
});

const initialState = buildEmptyInMemorySnapshot();

describe('RegisterUser', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        commandHandlerService.registerHandler(
            commandType,
            new RegisterUserCommandHandler(testRepositoryProvider, idManager)
        );

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

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState,
                checkStateOnSuccess: async ({ id }: RegisterUser) => {
                    const userSearchResult = await testRepositoryProvider
                        .getUserRepository()
                        .fetchById(id);

                    expect(userSearchResult).toBeInstanceOf(CoscradUser);

                    assertEventRecordPersisted(
                        userSearchResult as CoscradUser,
                        'USER_REGISTERED',
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the external state is invalid', () => {
            describe('when there is already a user with the given id', () => {
                it('should fail', async () => {
                    const newId = await idManager.generate();

                    await testRepositoryProvider.addFullSnapshot(
                        buildInMemorySnapshot({ user: [existingUser.clone({ id: newId })] })
                    );

                    /**
                     * We are invalidating the command by invalidating the existing
                     * state rather than the payload here.
                     */
                    const fsaWithDuplicateUserId = buildValidCommandFSA(newId);

                    const executionResult =
                        await commandAssertionDependencies.commandHandlerService.execute(
                            fsaWithDuplicateUserId,
                            // TODO we need type safety here
                            { userId: dummySystemUserId }
                        );

                    assertExternalStateError(executionResult);
                });
            });

            describe('when there is already a user with the given auth provider assigned user ID', () => {
                it('should fail', async () => {
                    await assertCreateCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        buildCommandFSA: (newId: AggregateId) =>
                            buildInvalidFSA(newId, {
                                userIdFromAuthProvider: existingUser.authProviderUserId,
                            }),
                        initialState: buildInMemorySnapshot({ user: [existingUser] }),
                        checkError: (error) => assertExternalStateError(error),
                    });
                });
            });

            describe('when there is already a user with the given id', () => {
                it('should fail', async () => {
                    await assertCreateCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        buildCommandFSA: (newId: AggregateId) =>
                            buildInvalidFSA(newId, { username: existingUser.username }),
                        initialState: buildInMemorySnapshot({ user: [existingUser] }),
                        checkError: (error) => assertExternalStateError(error),
                    });
                });
            });
        });

        describe('when the id has not been generated via our system', () => {
            it('should return the expected error', async () => {
                const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

                await assertCreateCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) => buildInvalidFSA(bogusId, { id: bogusId }),
                    initialState,
                });
            });
        });

        describe('when the payload has a property with an invalid type', () => {
            const commandPayloadDataSchema = getCoscradDataSchema(RegisterUser);

            Object.entries(commandPayloadDataSchema).forEach(([propertyName, propertySchema]) => {
                const invalidValues = new FuzzGenerator(propertySchema).generateInvalidValues();

                invalidValues.forEach(({ value, description }) => {
                    describe(`when the property: ${propertyName} has an invalid value: ${value} (${description})`, () => {
                        it('should return the appropriate type error', async () => {
                            const validId = await idManager.generate();

                            const result = await commandHandlerService.execute(
                                buildInvalidFSA(validId, {
                                    [propertyName]: value,
                                }),
                                { userId: dummySystemUserId }
                            );

                            assertCommandPayloadTypeError(result, propertyName);
                        });
                    });
                });
            });
        });
    });
});
