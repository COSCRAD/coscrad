import { FactoryTestSuiteForAggregate } from '.';
import { AggregateType } from '../../../types/AggregateType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.photograph;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDTO = validInstance.toDTO();

export const buildPhotographFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases: [
        {
            description: `valid photograph`,
            dto: validDTO,
        },
    ],
    invalidCases: [...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType)],
    ...generateFuzzAggregateFactoryTestCases(aggregateType, validDTO),
});
