import { FactoryTestSuiteForAggregate } from '.';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../../types/AggregateType';

const aggregateType = AggregateType.song;

const validInstance = getValidAggregateInstanceForTest(aggregateType);

const validDto = validInstance.toDTO();

export const buildSongFactoryTestSet = (): FactoryTestSuiteForAggregate<typeof aggregateType> => ({
    aggregateType,
    validCases: [
        {
            description: 'valid song',
            dto: validDto,
        },
    ],
    invalidCases: [],
});
