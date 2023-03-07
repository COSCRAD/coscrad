import { AggregateFactoryInalidTestCase, FactoryTestSuiteForAggregate } from '.';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import buildDummyUuid from '../../../models/__tests__/utilities/buildDummyUuid';
import { AggregateType } from '../../../types/AggregateType';
import { ResourceType } from '../../../types/ResourceType';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import { generateFuzzAggregateFactoryTestCases } from './utilities/generate-fuzz-aggregate-factory-test-cases';

const aggregateType = AggregateType.playlist;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

const invalidComplexInvariantTestCases: AggregateFactoryInalidTestCase[] = [
    ...Object.values(ResourceType)
        .filter((t) => ![ResourceType.audioItem].includes(t))
        .map((resourceType) => ({
            description: 'when there is a playlist item with a disallowed resource type',
            dto: validInstance
                .clone({
                    items: [
                        {
                            resourceCompositeIdentifier: {
                                type: resourceType,
                                id: buildDummyUuid(987),
                            },
                        },
                    ],
                })
                .toDTO(),
            checkError: (result: unknown) => {
                assertErrorAsExpected(
                    result,
                    new InvariantValidationError(validInstance.getCompositeIdentifier(), [])
                );
            },
        })),
];

export const buildPlaylistFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof AggregateType.playlist
> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid playlist DTO',
            dto: validDto,
        },
    ],
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...generateFuzzAggregateFactoryTestCases(aggregateType, validDto),
        ...invalidComplexInvariantTestCases,
    ],
});
