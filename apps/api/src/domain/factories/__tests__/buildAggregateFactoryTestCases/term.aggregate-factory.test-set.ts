import { FactoryTestSuiteForAggregate } from '.';
import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import TermHasNoTextInAnyLanguageError from '../../../domainModelValidators/errors/term/TermHasNoTextInAnyLanguageError';
import { AggregateType } from '../../../types/AggregateType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const validTerm = getValidAggregateInstanceForTest(AggregateType.term);

const validTermDto = validTerm.toDTO();

export const buildTermAggregateFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof AggregateType.term
> => ({
    aggregateType: AggregateType.term,
    validCases: [
        {
            description: 'when the dto is valid',
            dto: validTermDto,
        },
    ],
    invalidCases: [
        {
            description: 'Both term and termEnglish are empty',
            dto: clonePlainObjectWithoutProperties(validTermDto, ['term', 'termEnglish']),
            checkError: (result: unknown) =>
                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(validTerm.getCompositeIdentifier(), [
                        new TermHasNoTextInAnyLanguageError(validTerm.id),
                    ])
                ),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(AggregateType.term),
        ...generateFuzzAggregateFactoryTestCases(AggregateType.term, validTermDto),
    ],
});
