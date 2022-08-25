import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import MediaItemHasNoTitleInAnyLanguageError from '../../../domainModelValidators/errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import buildInvariantValidationErrorFactoryFunction from '../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import { FactoryTestSuiteForAggregate } from './';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.mediaItem;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

export const buildMediaItemFactoryTestCaseSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases: [
        {
            description: `valid media item`,
            dto: validDto,
        },
    ],
    invalidCases: [
        {
            description: 'the media item has no title in either language',
            dto: clonePlainObjectWithoutProperties(validDto, ['title', 'titleEnglish']),
            checkError: (result: unknown) =>
                assertErrorAsExpected(
                    result,
                    buildInvariantValidationErrorFactoryFunction(aggregateType)(validDto.id, [
                        new MediaItemHasNoTitleInAnyLanguageError(validDto.id),
                    ])
                ),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
