import { AggregateId } from '../../../types/AggregateId';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../song/commands/song-created.event';
import { PublishMediaItem } from './publish-media-item.command';

export class MediaItemPublished extends BaseEvent {
    type = 'MEDIA_ITEM_PUBLISHED';

    meta: EventRecordMetadata;

    constructor(command: PublishMediaItem, eventId: AggregateId) {
        super(command, eventId);
    }
}
