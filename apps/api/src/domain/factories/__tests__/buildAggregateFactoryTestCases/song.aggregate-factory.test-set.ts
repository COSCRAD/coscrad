import { FactoryTestSuiteForAggregate } from '.';
import { clonePlainObjectWithoutProperties } from '../../../../lib/utilities/clonePlainObjectWithoutProperties';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { AggregateType } from '../../../types/AggregateType';
import buildInvariantValidationErrorFactoryFunction from '../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.song;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(aggregateType);

export const buildSongFactoryTestSet = (): FactoryTestSuiteForAggregate<typeof aggregateType> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid song',
            dto: validDto,
        },
    ],
    invalidCases: [
        {
            description: 'the start comes after the length',
            dto: validInstance.clone({
                startMilliseconds: validDto.lengthMilliseconds + 5,
            }),

            checkError: (result: unknown) =>
                assertErrorAsExpected(result, buildTopLevelError(validDto.id, [])),
        },
        {
            description: 'song does not have a title in any language',
            dto: clonePlainObjectWithoutProperties(validDto, ['title', 'titleEnglish']),
            checkError: (result: unknown) =>
                assertErrorAsExpected(result, buildTopLevelError(validDto.id, [])),
        },
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
    ],
});
