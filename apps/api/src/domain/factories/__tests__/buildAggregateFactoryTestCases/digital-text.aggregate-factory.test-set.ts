import { FactoryTestSuiteForAggregate } from '.';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.digitalText;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

/**
 * In the future, we really just need the happy path, null, and undefined cases,
 * and maybe one error to ensure that invariant validation errors are coming
 * through. We comprehensively test invariant validation elsewhere.
 */
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
