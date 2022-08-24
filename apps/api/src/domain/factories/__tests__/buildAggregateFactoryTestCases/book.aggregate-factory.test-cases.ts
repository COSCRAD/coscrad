import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import buildInvariantValidationErrorFactoryFunction from '../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import PublishedBookHasNoPagesError from '../../../models/book/entities/errors/PublishedBookHasNoPagesError';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import { FactoryTestSuiteForAggregate } from './';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const resourceType = ResourceType.book;

const validBookDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

const fuzzTestCases = generateFuzzAggregateFactoryTestCases(AggregateType.book, validBookDTO);

export const buildBookAggregateFactoryTestCases = (): FactoryTestSuiteForAggregate<
    typeof AggregateType.book
> => ({
    aggregateType: AggregateType.book,
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
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(AggregateType.book),
        ...fuzzTestCases,
    ],
});
