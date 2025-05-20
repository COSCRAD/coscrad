import {
    AGGREGATE_COMPOSITE_IDENTIFIER,
    AggregateCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { EventRecordMetadata } from './types/EventRecordMetadata';

export interface IEventPayload {
    [AGGREGATE_COMPOSITE_IDENTIFIER]: AggregateCompositeIdentifier;
}

export abstract class BaseEvent<
    // TODO Do this. Declare a Payload interface with `aggregateCompositeIdentifier` on it
    TPayload extends IEventPayload = IEventPayload
> {
    abstract type: string;

    protected attributionTemplate?: string;

    meta: EventRecordMetadata;

    payload: TPayload;

    constructor(
        payload: TPayload,
        { id: eventId, dateCreated: timestamp, userId, contributorIds }: EventRecordMetadata // eventId: AggregateId, // systemUserId: AggregateId, // timestamp?: number
    ) {
        this.payload = cloneToPlainObject(payload);

        this.meta = {
            dateCreated: timestamp || Date.now(),
            id: eventId,
            userId,
            contributorIds: contributorIds || [],
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

    public buildAttributionStatement() {
        /**
         * We dynamically build this statement from the event type so that we can gracefully
         * opt-in to generation little-by-little.
         */
        const eventDescription = isNonEmptyString(this.attributionTemplate)
            ? this.attributionTemplate
            : `${this.type
                  .split('_')
                  .map((s) => s.toLowerCase())
                  .join(' ')} by: `;

        return eventDescription;
    }

    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-66]
    // public static fromDto<T extends BaseEvent>(eventRecord: DTO<T>) {
    //     // @ts-expect-error we know more than the compiler here
    //     return new this.constructor(eventRecord);
    // }
}
