import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory } from '../domain/common';
import { MultilingualText } from '../domain/common/entities/multilingual-text';
import { Valid } from '../domain/domainModelValidators/Valid';
import { buildFakeTimersConfig } from '../domain/models/__tests__/utilities/buildFakeTimersConfig';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import { InternalError } from '../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `validate-invariants`;

const mockLogger = buildMockLogger();

const fakeTimersConfig = buildFakeTimersConfig();

describe(`**${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            // We don't need the event factory for this test
            new CoscradEventFactory([])
        );

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(ArangoQueryRunner)
            .useValue(new ArangoQueryRunner(databaseProvider))
            .compile();

        jest.useFakeTimers(fakeTimersConfig);
    });

    beforeEach(async () => {
        mockLogger.log.mockClear();
    });

    describe(`when the database state is valid`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.testSetup();

            const fullValidSnapshot = new DeluxeInMemoryStore(
                buildTestDataInFlatFormat()
            ).fetchFullSnapshotInLegacyFormat();

            await testRepositoryProvider.addFullSnapshot(fullValidSnapshot);
        });

        it(`should report no errors found`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            expect(mockLogger.log.mock.calls[0][0].toLowerCase().includes(`validating`)).toBe(true);

            expect(mockLogger.log.mock.calls[1][0].toLowerCase().includes(`no errors found`)).toBe(
                true
            );
        });
    });

    describe(`when the database state is invalid`, () => {
        const invalidTerm = getValidAggregateInstanceForTest(AggregateType.term).clone({
            text: new MultilingualText({
                items: [],
            }),
        });

        const termValidationError = invalidTerm.validateInvariants();

        expect(termValidationError).not.toBe(Valid);

        const expectedErrorMessage = (
            termValidationError as InternalError
        ).innerErrors[0].innerErrors[0].toString();

        const testDataWithoutTerms = buildTestDataInFlatFormat();

        delete testDataWithoutTerms[AggregateType.term];

        beforeEach(async () => {
            await testRepositoryProvider.testSetup();

            const snapshotWithInvalidTerm = new DeluxeInMemoryStore({
                ...testDataWithoutTerms,
                [AggregateType.term]: [invalidTerm],
            }).fetchFullSnapshotInLegacyFormat();

            await testRepositoryProvider.addFullSnapshot(snapshotWithInvalidTerm);
        });

        it(`should return the appropriate errors`, async () => {
            await CommandTestFactory.run(commandInstance, [cliCommandName]);

            const secondLogMessage = mockLogger.log.mock.calls[1][0].toLowerCase();

            const processMessageForComparison = (msg: string) =>
                msg.toLowerCase().replace('\n', '');

            const normalizedSecondLogMessage = processMessageForComparison(secondLogMessage);

            const normalizedExpectedErrorMessage =
                processMessageForComparison(expectedErrorMessage);

            expect(normalizedSecondLogMessage.includes(normalizedExpectedErrorMessage)).toBe(true);
        });
    });
});
