import getValidAggregateInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import { FactoryTestSuiteForAggregate } from './';
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
