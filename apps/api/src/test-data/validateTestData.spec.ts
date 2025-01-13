import { Test } from '@nestjs/testing';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { buildAllDataClassProviders } from '../app/controllers/__tests__/createTestModule';
import { Valid, isValid } from '../domain/domainModelValidators/Valid';
import { buildReferenceTree } from '../domain/models/shared/command-handlers/utilities/build-reference-tree';
import getId from '../domain/models/shared/functional/getId';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../domain/types/DeluxeInMemoryStore';
import formatAggregateCompositeIdentifier from '../queries/presentation/formatAggregateCompositeIdentifier';
import formatAggregateType from '../queries/presentation/formatAggregateType';
import assertTestInstancesOfTypeAreComprehensive from '../test-data/__tests__/assertTestInstancesOfTypeAreComprehensive';
import { DynamicDataTypeModule } from '../validation';
import assertEdgeConnectionContextStateIsValid from './__tests__/assertEdgeConnectionContextStateIsValid';
import buildTestData from './buildTestData';
import convertInMemorySnapshotToDatabaseFormat from './utilities/convertInMemorySnapshotToDatabaseFormat';

describe('buildTestData', () => {
    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [DynamicDataTypeModule],
            providers: [...buildAllDataClassProviders()],
        }).compile();

        await testModule.init();
    });

    const testData = buildTestData();

    const deluxeInMemoryStore = new DeluxeInMemoryStore(testData);

    deluxeInMemoryStore.fetchAllOfType(AggregateType.note).forEach((connection) => {
        describe(`${formatAggregateCompositeIdentifier(
            connection.getCompositeIdentifier()
        )}`, () => {
            it(`should have valid context state`, () => {
                assertEdgeConnectionContextStateIsValid(testData, connection);
            });
        });
    });

    Object.values(AggregateType).forEach((aggregateType) => {
        describe(`The test instances for ${formatAggregateType(aggregateType)}`, () => {
            it('should be comprehensive', () => {
                assertTestInstancesOfTypeAreComprehensive(aggregateType, testData);
            });

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

            it(`should contain no invalid references to other aggregates`, () => {
                const invalidReferences = deluxeInMemoryStore
                    .fetchAllOfType(aggregateType)
                    .flatMap((instance) => {
                        const TargetCtor = Object.getPrototypeOf(instance);

                        const expectedReferences = buildReferenceTree(TargetCtor, instance);

                        const missingReferences = deluxeInMemoryStore
                            .fetchReferences()
                            .compare(expectedReferences);

                        return missingReferences;
                    });

                expect(invalidReferences).toEqual([]);
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

        const testDataDirectory = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data`;

        /**
         * At one point, we used to version control `testData.json`. We realized
         * that, given the branch, one can simply run the present test and obtain
         * `testData.json`, so there isn't a lot of value in checking this in.
         * Further, one run this test and export the json file to some other location.
         *
         * For that reason, we have changed the name of this file to `testData.data.json`
         * which **is** gitignored.
         */
        const testDataFilePath = `${testDataDirectory}/testData.data.json`;

        const numberOfSpacesToIndent = 4;

        if (!existsSync(testDataDirectory)) {
            mkdirSync(testDataDirectory, { recursive: true });
        }

        writeFileSync(
            testDataFilePath,
            JSON.stringify(fullSnapshotInDatabaseFormat, null, numberOfSpacesToIndent).concat('\n')
        );
    });
});
