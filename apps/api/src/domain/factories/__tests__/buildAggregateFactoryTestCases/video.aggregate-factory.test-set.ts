import { FactoryTestSuiteForAggregate } from '.';
import { AggregateType } from '../../../types/AggregateType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.video;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

export const buildVideoFactoryTestSet = (): FactoryTestSuiteForAggregate<typeof aggregateType> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid video DTO',
            dto: validDto,
        },
    ],
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
