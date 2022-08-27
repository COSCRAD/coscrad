import { FactoryTestSuiteForAggregate } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import PublishedBookHasNoPagesError from '../../../models/book/entities/errors/PublishedBookHasNoPagesError';
import { ResourceType } from '../../../types/ResourceType';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = ResourceType.book;

const validBookDTO = getValidAggregateInstanceForTest(aggregateType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(aggregateType);

export const buildBookAggregateFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType: aggregateType,
    validCases: [
        {
            description: 'valid book',
            dto: validBookDTO,
        },
    ],
    invalidCases: [
        {
            description: 'A book with no pages cannot be published',
            dto: {
                ...validBookDTO,
                published: true,
                pages: [],
            },
            checkError: (result: unknown) =>
                assertErrorAsExpected(
                    result,
                    buildTopLevelError(validBookDTO.id, [new PublishedBookHasNoPagesError()])
                ),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validBookDTO),
    ],
});
