import { ICommand } from '@coscrad/commands';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { EventRecordMetadata } from './types/EventRecordMetadata';

export abstract class BaseEvent extends BaseDomainModel {
    abstract type: string;

    meta: EventRecordMetadata;

    payload: ICommand;

    constructor(command: ICommand, eventId: AggregateId, systemUserId: AggregateId) {
        super();

        this.payload = cloneToPlainObject(command);

        this.meta = {
            dateCreated: Date.now(),
            id: eventId,
            userId: systemUserId,
        };
    }
}
