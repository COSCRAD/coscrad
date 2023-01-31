import { Aggregate } from '../../domain/models/aggregate.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';

const PREFIX = 10000;

export const convertSequenceNumberToUuid = (sequenceNumber: number): string =>
    buildDummyUuid(PREFIX + sequenceNumber);

export const convertAggregatesIdToUuid = <T extends Aggregate = Aggregate>(aggregate: T): T => {
    const updatedAggregate = aggregate.clone<T>({
        id: convertSequenceNumberToUuid(parseInt(aggregate.id)),
    } as unknown as DeepPartial<DTO<T>>);

    return updatedAggregate;
};
