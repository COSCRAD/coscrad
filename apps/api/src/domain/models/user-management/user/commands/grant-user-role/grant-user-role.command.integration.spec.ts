import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../../../../test-data/buildTestData';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import buildEmptyInMemorySnapshot from '../../../../../utilities/buildEmptyInMemorySnapshot';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import AggregateNotFoundError from '../../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { GrantUserRole } from './grant-user-role.command';
import { GrantUserRoleCommandHandler } from './grant-user-role.command-handler';

const commandType = 'GRANT_USER_ROLE';

const existingUser = buildTestData().users[0].clone({
    id: buildDummyUuid(),
});

const validCommandFSA: FluxStandardAction<GrantUserRole> = {
    type: commandType,
    payload: {
        userId: existingUser.id,
        role: CoscradUserRole.projectAdmin,
    },
};

/**
 * We dynamically generate one valid case for each `CoscradUserRole`. In order
 * for this to work, it is necessary that there is no colision between the
 * new role to add and the initial role(s) of the user. This function allows us
 * to side-step that.
 */
const getDistinctRole = (role: CoscradUserRole): CoscradUserRole => {
    const allRoles = Object.values(CoscradUserRole);

    const indexOfRole = allRoles.findIndex((roleToTest) => roleToTest === role);

    // Return the next (cyclically) role in the list
    return allRoles[(indexOfRole + 1) % allRoles.length];
};

describe('GrantUserRole', () => {
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
            new GrantUserRoleCommandHandler(testRepositoryProvider, idManager)
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
        Object.values(CoscradUserRole).forEach((role) => {
            describe(`when the role is: ${role}`, () => {
                it('should succeed', async () => {
                    await assertCommandSuccess(commandAssertionDependencies, {
                        buildValidCommandFSA: () => ({
                            type: commandType,
                            payload: {
                                userId: existingUser.id,
                                role,
                            },
                        }),
                        initialState: buildInMemorySnapshot({
                            users: [
                                existingUser.clone({
                                    roles: [getDistinctRole(role)],
                                }),
                            ],
                        }),
                    });
                });
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when there is no user with the given ID', () => {
            it('should fail', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    initialState: buildEmptyInMemorySnapshot(),
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors[0]).toEqual(
                            new AggregateNotFoundError(existingUser.getCompositeIdentifier())
                        );
                    },
                });
            });
        });

        describe('when the user already has the given role', () => {
            it('should return the appropriate error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: () => validCommandFSA,
                    initialState: buildInMemorySnapshot({
                        users: [
                            existingUser.clone({
                                // the existing user already has the specified role
                                roles: [validCommandFSA.payload.role],
                            }),
                        ],
                    }),
                });
            });
        });

        describe('when there is a property with an invalid type on the command payload', () => {
            generateCommandFuzzTestCases(GrantUserRole).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
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
