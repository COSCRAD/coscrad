import { InternalError } from '../../../../../lib/errors/InternalError';
import buildTestData from '../../../../../test-data/buildTestData';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../../../types/AggregateType';
import { InMemorySnapshot, isResourceType } from '../../../../types/ResourceType';

export default <TAggregateType extends AggregateType>(
    aggregateType: TAggregateType
): AggregateTypeToAggregateInstance[TAggregateType] => {
    const testData = buildTestData();

    if (isResourceType(aggregateType))
        return testData.resources[
            aggregateType
        ][0] as AggregateTypeToAggregateInstance[TAggregateType];

    const allAggregatesOfType = testData[aggregateType as keyof InMemorySnapshot];

    if (!allAggregatesOfType) {
        throw new InternalError(
            `Failed to find a test instance of aggregate of type: ${aggregateType}`
        );
    }

    return allAggregatesOfType[0];
};
