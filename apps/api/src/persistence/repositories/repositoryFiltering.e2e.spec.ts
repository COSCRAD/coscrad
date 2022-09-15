import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { Term } from '../../domain/models/term/entities/term.entity';
import TermEnglishEquals from '../../domain/repositories/specifications/TermEnglishEquals';
import { ResourceType } from '../../domain/types/ResourceType';
import buildTestData from '../../test-data/buildTestData';
import generateDatabaseNameForTestSuite from './__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository for entity (with filters)', () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    const testData = buildTestData().resources;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    beforeAll(async () => {
        ({ app, testRepositoryProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));
    });

    afterAll(async () => {
        await app.close();
    });

    describe('fetchMany', () => {
        beforeEach(async () => {
            await testRepositoryProvider.testSetup();
        });

        afterEach(async () => {
            await testRepositoryProvider.testTeardown();
        });
        describe('when there is data that matches the specification', () => {
            it('should find the matching data', async () => {
                const textToMatch = 'foobar';

                const matchingTerms = testData[ResourceType.term].map(
                    (term) =>
                        new Term({
                            ...term.toDTO(),
                            termEnglish: textToMatch,
                        })
                );

                const nonMatchingTerms = testData[ResourceType.term]
                    .map(
                        (term, index) =>
                            new Term({
                                ...term.toDTO(),
                                id: `UNIQUE-TERM-ID-${index + 1}`,
                                termEnglish: 'no-match',
                            })
                    )
                    .slice(0, -1);

                const allTerms = [...matchingTerms, ...nonMatchingTerms];

                await testRepositoryProvider.addResourcesOfSingleType(ResourceType.term, allTerms);

                const specification = new TermEnglishEquals(textToMatch);

                const foundTerms = await testRepositoryProvider
                    .forResource<Term>(ResourceType.term)
                    .fetchMany(specification);

                expect(foundTerms.length).toBe(matchingTerms.length);

                expect(JSON.stringify(foundTerms)).toEqual(JSON.stringify(matchingTerms));
            });
        });

        describe('when there is no data that matches the specification', () => {
            it('should return an empty result set', async () => {
                const terms = testData[ResourceType.term];

                const unmatchedSearchTerm = 'abcdefghijklmnopqrstuvwxyz-123';

                const specification = new TermEnglishEquals(unmatchedSearchTerm);

                await testRepositoryProvider.addResourcesOfSingleType(ResourceType.term, terms);

                const searchResult = await testRepositoryProvider
                    .forResource<Term>(ResourceType.term)
                    .fetchMany(specification);

                expect(searchResult).toEqual([]);
            });
        });
    });
});
