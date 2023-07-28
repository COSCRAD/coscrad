import { buildDummyUuid } from './build-dummy-uuid';

type CompositeIdentifier = {
    id: string;
    type: string;
};

export const buildDummyAggregateCompositeIdentifier = (
    aggregateType: string,
    sequenceNumber: number
): CompositeIdentifier => ({
    id: buildDummyUuid(sequenceNumber),
    type: aggregateType,
});
