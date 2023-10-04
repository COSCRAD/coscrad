import { FactoryTestSuiteForAggregate } from '.';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.digitalText;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

export const buildDigitalTextFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid digital text',
            dto: validDto,
        },
    ],
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
