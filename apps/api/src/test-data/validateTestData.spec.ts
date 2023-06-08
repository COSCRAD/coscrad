import { writeFileSync } from 'fs';
import { isValid, Valid } from '../domain/domainModelValidators/Valid';
import getId from '../domain/models/shared/functional/getId';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import assertTestInstancesOfTypeAreComprehensive from '../test-data/__tests__/assertTestInstancesOfTypeAreComprehensive';
import formatAggregateCompositeIdentifier from '../view-models/presentation/formatAggregateCompositeIdentifier';
import formatAggregateType from '../view-models/presentation/formatAggregateType';
import buildTestData from './buildTestData';
import convertInMemorySnapshotToDatabaseFormat from './utilities/convertInMemorySnapshotToDatabaseFormat';
import assertEdgeConnectionContextStateIsValid from './__tests__/assertEdgeConnectionContextStateIsValid';

describe('buildTestData', () => {
    const testData = buildTestData();

    const deluxeInMemoryStore = new DeluxeInMemoryStore(testData);

    Object.values(AggregateType).forEach((aggregateType) => {
        describe(`The test instances for ${formatAggregateType(aggregateType)}`, () => {
            it('should be comprehensive', () => {
                assertTestInstancesOfTypeAreComprehensive(aggregateType, testData);
            });

            if (aggregateType === AggregateType.note) {
                deluxeInMemoryStore
                    .fetchAllOfType(AggregateType.note)
                    .forEach((connection) =>
                        assertEdgeConnectionContextStateIsValid(testData, connection)
                    );
            }

            /**
             * Ideally, we would check this with logic that is on the aggregate
             * models (e.g. `validateExternalState`). However, it is not efficient
             * to remove each aggregate instance from the snapshot to create the
             * `externalState` within a loop.
             */
            it(`should contain no duplicate identifiers`, () => {
                const duplicateIdentifiers = deluxeInMemoryStore
                    .fetchAllOfType(aggregateType)
                    .map(getId)
                    .reduce((acc: Map<'duplicates' | 'known', AggregateId[]>, id: AggregateId) => {
                        if (acc.get('known').includes(id)) {
                            return acc.set('duplicates', [
                                ...new Set([...acc.get('duplicates'), id]),
                            ]);
                        }

                        return acc.set('known', [...new Set([...acc.get('known'), id])]);
                    }, new Map().set('duplicates', []).set('known', []))
                    .get('duplicates');

                expect(duplicateIdentifiers).toEqual([]);
            });

            deluxeInMemoryStore.fetchAllOfType(aggregateType).forEach((aggregate) => {
                const externalState = deluxeInMemoryStore.fetchFullSnapshotInLegacyFormat();

                describe(`${formatAggregateCompositeIdentifier(
                    aggregate.getCompositeIdentifier()
                )}`, () => {
                    it('should satisfy all invariants', () => {
                        const validationResult = aggregate.validateInvariants();

                        const validMessage = 'VALID';

                        const validationMessage = isValid(validationResult)
                            ? validMessage
                            : validationResult.toString();

                        expect(validationMessage).toBe(validMessage);
                    });

                    it('should contain no inconsistent references to the external state (other test data)', () => {
                        const externalReferencesValidationResult =
                            aggregate.validateExternalReferences(externalState);

                        expect(externalReferencesValidationResult).toBe(Valid);
                    });
                });
            });
        });
    });

    // If the test succeeds, write the data
    afterAll(() => {
        const fullSnapshotInDatabaseFormat = convertInMemorySnapshotToDatabaseFormat(testData);

        const testDataFilePath = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json`;

        const numberOfSpacesToIndent = 4;

        writeFileSync(
            testDataFilePath,
            JSON.stringify(fullSnapshotInDatabaseFormat, null, numberOfSpacesToIndent).concat('\n')
        );
    });
});
