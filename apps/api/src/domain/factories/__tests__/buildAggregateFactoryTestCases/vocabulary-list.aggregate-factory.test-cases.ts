import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import VocabularyListHasNoEntriesError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoEntriesError';
import VocabularyListHasNoNameInAnyLanguageError from '../../../domainModelValidators/errors/vocabularyList/VocabularyListHasNoNameInAnyLanguageError';
import buildInvariantValidationErrorFactoryFunction from '../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';
import { FactoryTestSuiteForAggregate } from './';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.vocabularyList;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(aggregateType);

export const buildVocabularyListAggregateFactoryTestCases = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType: aggregateType,
    validCases: [],
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
