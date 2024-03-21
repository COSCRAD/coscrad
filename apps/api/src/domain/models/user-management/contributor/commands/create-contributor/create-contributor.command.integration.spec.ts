import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { IIdManager } from '../../../../../../domain/interfaces/id-manager.interface';
import { AggregateId } from '../../../../../../domain/types/AggregateId';
import buildEmptyInMemorySnapshot from '../../../../../../domain/utilities/buildEmptyInMemorySnapshot';
import { ArangoDatabaseProvider } from '../../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../../types/DTO';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { buildFakeTimersConfig } from '../../../../__tests__/utilities/buildFakeTimersConfig';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { CoscradContributor } from '../../entities/coscrad-contributor.entity';
import { CreateContributor } from './create-contributor.command';

const commandType = 'CREATE_CONTRIBUTOR';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateContributor>> => ({
    type: commandType,

    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.contributor },
        firstName: "the contributor's first name",
        lastName: "the contributor's last name",
    },
});

const initialState = buildEmptyInMemorySnapshot();

describe('CreateContributor', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                },
                { shouldMockIdGenerator: true }
            ));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };

        jest.useFakeTimers(buildFakeTimersConfig());
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

    describe(`when the command is valid`, () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateContributor) => {
                    const contributorSearchResult = await testRepositoryProvider
                        .getContributorRepository()
                        .fetchById(id);

                    expect(contributorSearchResult).toBeInstanceOf(CoscradContributor);
                },
            });
        });
    });
});
