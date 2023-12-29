import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isDeepStrictEqual } from 'util';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { ICoscradEvent } from '../../../common/events/coscrad-event.interface';
import { AggregateId } from '../../../types/AggregateId';
import { EventRecordMetadata } from './types/EventRecordMetadata';

export interface IEventPayload {
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;
}

export abstract class BaseEvent<
    // TODO Do this. Declare a Payload interface with `aggregateCompositeIdentifier` on it
    TPayload extends IEventPayload = IEventPayload
> implements ICoscradEvent<TPayload, EventRecordMetadata>
{
    abstract type: string;

    meta: EventRecordMetadata;

    payload: TPayload;

    constructor(
        command: TPayload,
        { id: eventId, dateCreated: timestamp, userId }: EventRecordMetadata // eventId: AggregateId, // systemUserId: AggregateId, // timestamp?: number
    ) {
        this.payload = cloneToPlainObject(command);

        this.meta = {
            dateCreated: timestamp || Date.now(),
            id: eventId,
            userId,
        };
    }

    public get id(): AggregateId {
        return this.meta.id;
    }

    public isOfType(eventType: string): boolean {
        return eventType === this.type;
    }

    public isFor(compositeIdentifier: { type: string; id: string }): boolean {
        return isDeepStrictEqual(this.payload[AGGREGATE_COMPOSITE_IDENTIFIER], compositeIdentifier);
    }

    public toDTO<T extends BaseEvent>(this: T): DTO<this> {
        // note that getters do not survive conversion to a plain object
        return cloneToPlainObject({ ...this, id: this.id });
    }
}
