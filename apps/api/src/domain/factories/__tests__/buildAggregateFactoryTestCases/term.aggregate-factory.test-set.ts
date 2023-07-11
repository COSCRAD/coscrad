import { FactoryTestSuiteForAggregate } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { MultilingualTextHasNoOriginalError } from '../../../models/audio-item/errors/multilingual-text-has-no-original.error';
import { AggregateType } from '../../../types/AggregateType';
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
            description: 'The term has no text in any language',
            dto: validTerm.clone({
                text: new MultilingualText({ items: [] }),
            }),
            checkError: (result: unknown) => {
                assertErrorAsExpected(
                    (result as InternalError).innerErrors[0].innerErrors[0],
                    new MultilingualTextHasNoOriginalError()
                );
            },
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(AggregateType.term),
        ...generateFuzzAggregateFactoryTestCases(AggregateType.term, validTermDto),
    ],
});
