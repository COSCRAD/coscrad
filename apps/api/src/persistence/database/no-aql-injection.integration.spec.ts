import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { Book } from '../../domain/models/book/entities/book.entity';
import { ISpecification } from '../../domain/repositories/interfaces/ISpecification';
import { QueryOperator } from '../../domain/repositories/interfaces/QueryOperator';
import generateRandomTestDatabaseName from '../repositories/__tests__/generateRandomTestDatabaseName';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';

const dummyDbName = generateRandomTestDatabaseName();

describe(`Arango Database`, () => {
    let dbInstance: ArangoDatabase;

    beforeAll(async () => {
        const { databaseProvider } = await setUpIntegrationTest({
            ARANGO_DB_NAME: dummyDbName,
        });

        dbInstance = databaseProvider.getDBInstance();
    });

    describe(`fetchMany`, () => {
        it('should be safe against AQL injection', async () => {
            const injectionSpecification: ISpecification<Book, string> = {
                criterion: {
                    field: 'foo',
                    operator: QueryOperator.equals,
                    value: `7 || true`,
                },

                isSatisfiedBy: (_: Book) => true,
            };

            const result = await dbInstance.fetchMany(
                ArangoCollectionId.books,
                injectionSpecification
            );

            expect(result).toEqual([]);
        });
    });
});
