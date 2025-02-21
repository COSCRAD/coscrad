import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { Aggregate } from '../../domain/models/aggregate.entity';
import { DTO } from '../../types/DTO';
import { DeepPartial } from '../../types/DeepPartial';

const PREFIX = 10000;

export const convertSequenceNumberToUuid = (sequenceNumber: number): string => {
    return buildDummyUuid(PREFIX + sequenceNumber);
};

export const convertAggregatesIdToUuid = <T extends Aggregate = Aggregate>(aggregate: T): T => {
    const updatedAggregate = aggregate.clone<T>({
        id: convertSequenceNumberToUuid(parseInt(aggregate.id)),
        // Note that we do not map over event IDs here as we don't need to find them by sequence number
    } as unknown as DeepPartial<DTO<T>>);

    return updatedAggregate;
};
