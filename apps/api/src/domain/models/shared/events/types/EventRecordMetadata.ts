import { AggregateId } from '../../../../types/AggregateId';

export type EventRecordMetadata = {
    dateCreated: number;

    id: AggregateId;

    userId: AggregateId;

    // we make `contributorIds` optional here for backwards compatibility
    contributorIds?: AggregateId[];
};
