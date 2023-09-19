import setUpIntegrationTest from '../app/controllers/__tests__/setUpIntegrationTest';
import { AggregateType } from '../domain/types/AggregateType';
import buildTestDataInFlatFormat from '../test-data/buildTestDataInFlatFormat';
import { REPOSITORY_PROVIDER_TOKEN } from './constants/persistenceConstants';
import generateDatabaseNameForTestSuite from './repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryProvider } from './repositories/arango-repository.provider';

describe(`Arango Repository Provider`, () => {
    let arangoRepositoryProvider: ArangoRepositoryProvider;

    beforeAll(async () => {
        const { app, databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        await app.init();

        databaseProvider;

        arangoRepositoryProvider = app.get(REPOSITORY_PROVIDER_TOKEN);
    });

    describe(`forResource: term`, () => {
        describe(`fetchMany`, () => {
            it(`should return the desired results`, async () => {
                const dummyTerms = buildTestDataInFlatFormat().term;

                const termRepository = arangoRepositoryProvider.forResource(AggregateType.term);

                const allTerms = await termRepository.fetchMany();

                expect(allTerms.length).toBe(dummyTerms.length);
            });
        });
    });
});
