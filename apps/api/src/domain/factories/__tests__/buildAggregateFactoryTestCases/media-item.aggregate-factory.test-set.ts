import { FactoryTestSuiteForAggregate } from '.';
import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import MediaItemHasNoTitleInAnyLanguageError from '../../../domainModelValidators/errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import { AggregateType } from '../../../types/AggregateType';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.mediaItem;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

export const buildMediaItemFactoryTestSet = (): FactoryTestSuiteForAggregate<
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
