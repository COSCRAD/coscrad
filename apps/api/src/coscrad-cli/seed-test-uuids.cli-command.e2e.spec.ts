import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../domain/common';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { MockIdManagementService } from '../lib/id-generation/mock-id-management.service';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoIdRepository } from '../persistence/repositories/arango-id-repository';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `seed-test-uuids`;

describe(`CLI Command: **${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    const mockLogger = buildMockLogger({ isEnabled: false });

    const executeWithQuantity = async (quantityAsString: string) => {
        await CommandTestFactory.run(commandInstance, [
            cliCommandName,
            `--quantity=${quantityAsString}`,
        ]);
    };

    beforeEach(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        const coscradEventFactory = testAppModule.get(CoscradEventFactory);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider, coscradEventFactory);

        idManager = new MockIdManagementService(new ArangoIdRepository(databaseProvider));

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(ArangoDatabaseProvider)
            .useValue(databaseProvider)
            .overrideProvider(ID_MANAGER_TOKEN)
            .useValue(idManager)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();

        await testRepositoryProvider.testSetup();

        jest.clearAllMocks();
    });

    const assertMessageIncludes = (message: string, substringsToFind: string[]): void => {
        const unseenMessages = substringsToFind.filter((subString) => !message.includes(subString));

        expect(unseenMessages).toEqual([]);
    };

    const assertUuidsCreated = async (quantity: number): Promise<void> => {
        const numberOfUuidsInDb = await databaseProvider
            .getDatabaseForCollection(ArangoCollectionId.uuids)
            .getCount();

        expect(numberOfUuidsInDb).toBe(quantity);
    };

    // TODO add a valid case at the boundary of the allowed quantity
    describe(`when the command is valid`, () => {
        describe(`when creating a smaller number (100) of IDs`, () => {
            const numberOfUuidsToSeed = 100;

            it(`should succeed`, async () => {
                await executeWithQuantity(numberOfUuidsToSeed.toString());

                const firstLoggedMessage = mockLogger.log.mock.calls[0][0];

                const messagesToInclude = [`Success.`];

                assertMessageIncludes(firstLoggedMessage, messagesToInclude);

                await assertUuidsCreated(numberOfUuidsToSeed);
            });
        });

        describe(`when creating the largest allowed number (9999) of IDs`, () => {
            const numberOfUuidsToSeed = 9999;

            it(`should succeed`, async () => {
                await executeWithQuantity(numberOfUuidsToSeed.toString());

                const firstLoggedMessage = mockLogger.log.mock.calls[0][0];

                const messagesToInclude = [`Success.`];

                assertMessageIncludes(firstLoggedMessage, messagesToInclude);

                await assertUuidsCreated(numberOfUuidsToSeed);
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the quantity is not a number`, () => {
            it(`should fail and log the expected message`, async () => {
                await executeWithQuantity(`foobarbaz`);

                const firstLoggedMessage = mockLogger.log.mock.calls[0][0];

                const messagesToInclude = [`Failed to parse quantity`];

                assertMessageIncludes(firstLoggedMessage, messagesToInclude);

                await assertUuidsCreated(0);
            });
        });

        describe(`when the quantity is an invalid number`, () => {
            const descriptionsAndInvalidLabels: [string, string][] = [
                ['zero', '0'],
                ['decimal', '1.2'],
                ['negative', '-3'],
                ['very large', '10000000000'],
                ['a little too large', '10000'],
            ];

            descriptionsAndInvalidLabels.forEach(([description, quantityAsString]) => {
                describe(`when the value is: ${description} (${quantityAsString})`, () => {
                    it(`should fail and log the expected message`, async () => {
                        await executeWithQuantity(quantityAsString);

                        const firstLoggedMessage = mockLogger.log.mock.calls[0][0];

                        const messagesToInclude = [quantityAsString, 'Invalid input'];

                        assertMessageIncludes(firstLoggedMessage, messagesToInclude);

                        await assertUuidsCreated(0);
                    });
                });
            });
        });
    });
});
