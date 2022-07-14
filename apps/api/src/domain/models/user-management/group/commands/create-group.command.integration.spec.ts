import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { NotAvailable } from '../../../../../lib/types/not-available';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../types/DTO';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import buildEmptyInMemorySnapshot from '../../../../utilities/buildEmptyInMemorySnapshot';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { CoscradUserGroup } from '../entities/coscrad-user-group.entity';
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

describe('CreateGroup', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        commandHandlerService.registerHandler(
            commandType,
            new CreateGroupCommandHandler(testRepositoryProvider, idManager)
        );

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
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
                },
            });
        });
    });
});
