import { ICommandBase } from '@coscrad/api-interfaces';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { EventRecordMetadata } from './types/EventRecordMetadata';

export abstract class BaseEvent<
    // TODO Declare an IEventBase with `aggregateCompositeIdentifier` on it
    TPayload extends ICommandBase = ICommandBase
> {
    abstract type: string;

    meta: EventRecordMetadata;

    payload: TPayload;

    constructor(
        command: TPayload,
        eventId: AggregateId,
        systemUserId: AggregateId,
        timestamp?: number
    ) {
        this.payload = cloneToPlainObject(command);

        this.meta = {
            dateCreated: timestamp || Date.now(),
            id: eventId,
            userId: systemUserId,
        };
    }

    public get id(): AggregateId {
        return this.meta.id;
    }

    public toDTO<T extends BaseEvent>(this: T): DTO<this> {
        // note that getters do not survive conversion to a plain object
        return cloneToPlainObject({ ...this, id: this.id });
    }
}
