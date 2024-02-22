import { FactoryTestSuiteForAggregate } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import VocabularyListWithNoEntriesCannotBePublishedError from '../../../domainModelValidators/errors/vocabularyList/vocabulary-list-with-no-entries-cannot-be-published.error';
import { MultilingualTextHasNoOriginalError } from '../../../models/audio-visual/audio-item/errors/multilingual-text-has-no-original.error';
import { AggregateType } from '../../../types/AggregateType';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.vocabularyList;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(aggregateType);

export const buildVocabularyListAggregateFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType: aggregateType,
    validCases: [
        {
            description: `valid vocabulary list`,
            dto: validDto,
        },
    ],
    invalidCases: [
        {
            description: 'the vocabulary list has no name in either language',
            dto: {
                ...validDto,
                name: {
                    items: [],
                },
            },
            checkError: (result: unknown) => {
                assertErrorAsExpected(
                    (result as InternalError).innerErrors[0].innerErrors[0],
                    new MultilingualTextHasNoOriginalError()
                );
            },
        },
        {
            description: 'vocabulary list has no entries',
            dto: validInstance.clone({
                entries: [],
                published: true,
            }),
            checkError: (result) =>
                assertErrorAsExpected(
                    result,
                    buildTopLevelError(validDto.id, [
                        new VocabularyListWithNoEntriesCannotBePublishedError(validDto.id),
                    ])
                ),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
