import { FactoryTestSuiteForAggregate } from '.';
import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import VocabularyListHasNoEntriesError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import { AggregateType } from '../../../types/AggregateType';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
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
            dto: clonePlainObjectWithoutProperties(validDto, ['name', 'nameEnglish']),
            checkError: (result: unknown) =>
                assertErrorAsExpected(
                    result,
                    buildTopLevelError(validDto.id, [
                        new VocabularyListHasNoNameInAnyLanguageError(),
                    ])
                ),
        },
        {
            description: 'vocabulary list has no entries',
            dto: validInstance.clone({
                entries: [],
            }),
            checkError: (result) =>
                assertErrorAsExpected(
                    result,
                    buildTopLevelError(validDto.id, [
                        new VocabularyListHasNoEntriesError(validDto.id),
                    ])
                ),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
