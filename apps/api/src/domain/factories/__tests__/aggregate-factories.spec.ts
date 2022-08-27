import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import formatAggregateType from '../../../view-models/presentation/formatAggregateType';
import { Aggregate } from '../../models/aggregate.entity';
import { isResourceType, ResourceType } from '../../types/ResourceType';
import getInstanceFactoryForResource from '../getInstanceFactoryForResource';
import buildAggregateFactoryTestCases from './buildAggregateFactoryTestCases';

const testCaseSets = buildAggregateFactoryTestCases();

describe(`Aggregate factories`, () => {
    /**
     * TODO [https://www.pivotaltracker.com/story/show/183109452]
     * Change this to `AggregateType` and add test coverage for non-resource
     * aggregates.
     */
    Object.values(ResourceType).forEach((aggregateType) =>
        describe(`An aggregate of type: ${formatAggregateType(aggregateType)}`, () => {
            describe(`the corresponding test suite`, () => {
                const testSuite = testCaseSets.find(
                    ({ aggregateType: testSuiteAggregateType }) =>
                        aggregateType === testSuiteAggregateType
                );

                it(`should exist`, () => {
                    expect(testSuite).toBeTruthy();
                });

                it(`should have at least one valid test case`, () => {
                    expect(testSuite?.validCases?.length || 0).toBeGreaterThan(0);
                });

                it(`should have at least one invalid test case`, () => {
                    expect(testSuite?.invalidCases?.length || 0).toBeGreaterThan(0);
                });
            });
        })
    );

    testCaseSets
        // TODO [https://www.pivotaltracker.com/story/show/183109452] Remove filter
        .filter(({ aggregateType }) => isResourceType(aggregateType))
        .forEach(({ aggregateType, validCases, invalidCases }) => {
            // TODO [https://www.pivotaltracker.com/story/show/183109452] remove cast when removing filter
            const buildInstance = getInstanceFactoryForResource(aggregateType as ResourceType);

            describe(`when attempting to build an instance of type: ${aggregateType} from a DTO`, () => {
                describe(`when the DTO is valid`, () => {
                    validCases.forEach(({ dto, description }) =>
                        describe(description, () => {
                            it('should succeed', () => {
                                const result = buildInstance(dto);

                                expect(result).not.toBeInstanceOf(InternalError);

                                // Verify the mapping from DTO to instance by inspection
                                expect(result).toMatchSnapshot();
                            });
                        })
                    );
                });

                invalidCases.forEach(({ description, dto, checkError }) =>
                    describe(description, () => {
                        it('should return an appropriate error', () => {
                            const result = buildInstance(dto as DTO<Aggregate>);

                            checkError(result);
                        });
                    })
                );
            });
        });
});
