import { INestApplication } from '@nestjs/common';
import createTestModule from '../../app/controllers/__tests__/createTestModule';
import { Term } from '../../domain/models/term/entities/term.entity';
import TermEnglishEquals from '../../domain/repositories/specifications/TermEnglishEquals';
import { entityTypes } from '../../domain/types/entityTypes';
import buildTestData from '../../test-data/buildTestData';
import { ArangoConnectionProvider } from '../database/arango-connection.provider';
import { DatabaseProvider } from '../database/database.provider';
import generateRandomTestDatabaseName from './__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from './__tests__/TestRepositoryProvider';

describe('Repository for entity (with filters)', () => {
    const testDatabaseName = generateRandomTestDatabaseName();

    const testData = buildTestData();

    let arangoConnectionProvider: ArangoConnectionProvider;

    let databaseProvider: DatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    beforeAll(async () => {
        jest.resetModules();

        const moduleRef = await createTestModule(testDatabaseName);

        arangoConnectionProvider =
            moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new DatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        app = moduleRef.createNestApplication();

        await app.init();
    });

    afterAll(async () => {
        await testRepositoryProvider.testTeardown();

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

                const matchingTerms = testData[entityTypes.term].map(
                    (term) =>
                        new Term({
                            ...term.toDTO(),
                            termEnglish: textToMatch,
                        })
                );

                const nonMatchingTerms = testData[entityTypes.term]
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

                await testRepositoryProvider.addEntitiesOfSingleType(entityTypes.term, allTerms);

                const specification = new TermEnglishEquals(textToMatch);

                const foundTerms = await testRepositoryProvider
                    .forEntity<Term>(entityTypes.term)
                    .fetchMany(specification);

                expect(foundTerms.length).toBe(matchingTerms.length);

                expect(JSON.stringify(foundTerms)).toEqual(JSON.stringify(matchingTerms));
            });
        });

        describe('when there is no data that matches the specification', () => {
            it('should return an empty result set', async () => {
                const terms = testData[entityTypes.term];

                const unmatchedSearchTerm = 'abcdefghijklmnopqrstuvwxyz-123';

                const specification = new TermEnglishEquals(unmatchedSearchTerm);

                await testRepositoryProvider.addEntitiesOfSingleType(entityTypes.term, terms);

                const searchResult = await testRepositoryProvider
                    .forEntity<Term>(entityTypes.term)
                    .fetchMany(specification);

                expect(searchResult).toEqual([]);
            });
        });
    });
});
