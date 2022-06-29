import { AggregateId } from '../../../types/AggregateId';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../song/commands/song-created.event';
import { CreateMediaItem } from './create-media-item.command';

export class MediaItemCreated extends BaseEvent {
    type = 'MEDIA_ITEM_CREATED';

    meta: EventRecordMetadata;

    constructor(command: CreateMediaItem, eventId: AggregateId) {
        super(command, eventId);
    }
}
