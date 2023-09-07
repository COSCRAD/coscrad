import { ICommandBase } from '@coscrad/api-interfaces';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { EventRecordMetadata } from './types/EventRecordMetadata';

export abstract class BaseEvent extends BaseDomainModel {
    abstract type: string;

    meta: EventRecordMetadata;

    payload: ICommandBase;

    constructor(
        command: ICommandBase,
        eventId: AggregateId,
        systemUserId: AggregateId,
        timestamp?: number
    ) {
        super();

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
}
