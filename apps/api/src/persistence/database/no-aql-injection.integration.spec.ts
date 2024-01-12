import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import { DigitalText } from '../../domain/models/digital-text/entities';
import { QueryOperator } from '../../domain/repositories/interfaces/QueryOperator';
import { ISpecification } from '../../domain/repositories/interfaces/specification.interface';
import generateDatabaseNameForTestSuite from '../repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoDatabase } from './arango-database';
import { ArangoCollectionId } from './collection-references/ArangoCollectionId';

const dummyDbName = generateDatabaseNameForTestSuite();

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
            const injectionSpecification: ISpecification<DigitalText, string> = {
                criterion: {
                    field: 'foo',
                    operator: QueryOperator.equals,
                    value: `7 || true`,
                },

                isSatisfiedBy: (_: DigitalText) => true,
            };

            const result = await dbInstance.fetchMany(
                ArangoCollectionId.digital_texts,
                injectionSpecification
            );

            expect(result).toEqual([]);
        });
    });
});
