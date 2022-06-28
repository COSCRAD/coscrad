import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { IEvent } from '../../shared/events/interfaces/event.interface';
import { EventRecordMetadata } from '../../song/commands/song-created.event';
import { CreateMediaItem } from './create-media-item.command';

export class MediaItemCreated extends BaseDomainModel implements IEvent {
    type = 'MEDIA_ITEM_CREATED';

    meta: EventRecordMetadata;

    constructor(command: CreateMediaItem, eventId: AggregateId) {
        super();

        Object.assign(this, command);

        this.meta = {
            dateCreated: Date.now(),
            id: eventId,
        };
    }
}
