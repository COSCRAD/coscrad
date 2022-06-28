import { AggregateId } from '../../../types/AggregateId';
import BaseDomainModel from '../../BaseDomainModel';
import { IEvent } from '../../shared/events/interfaces/event.interface';
import { EventRecordMetadata } from '../../song/commands/song-created.event';
import { PublishMediaItem } from './publish-media-item.command';

export class MediaItemPublished extends BaseDomainModel implements IEvent {
    type = 'MEDIA_ITEM_PUBLISHED';

    meta: EventRecordMetadata;

    constructor(command: PublishMediaItem, eventId: AggregateId) {
        super();

        Object.assign(this, command);

        this.meta = {
            dateCreated: Date.now(),
            id: eventId,
        };
    }
}
