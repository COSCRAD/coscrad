import { AggregateId } from '../../../../types/AggregateId';

export type EventRecordMetadata = {
    dateCreated: number;

    id: AggregateId;

    userId: AggregateId;
};
