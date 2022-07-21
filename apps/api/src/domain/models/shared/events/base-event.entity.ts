import { ICommand } from '@coscrad/commands';
import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { EventRecordMetadata } from '../../song/commands/song-created.event';

export abstract class BaseEvent extends BaseDomainModel {
    abstract type: string;

    meta: EventRecordMetadata;

    constructor(command: ICommand, eventId: AggregateId) {
        super();

        Object.assign(this, command);

        this.meta = {
            dateCreated: Date.now(),
            id: eventId,
        };
    }
}
