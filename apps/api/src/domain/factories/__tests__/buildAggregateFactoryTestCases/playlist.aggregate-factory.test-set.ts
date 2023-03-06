import { FactoryTestSuiteForAggregate } from '.';
import { AggregateType } from '../../../types/AggregateType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.playlist;

const validDto = getValidAggregateInstanceForTest(aggregateType).toDTO();

export const buildPlaylistFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof AggregateType.playlist
> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid playlist DTO',
            dto: validDto,
        },
    ],
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
