import { AggregateId } from '../../../types/AggregateId';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { PublishSong } from './publish-song.command';
import { EventRecordMetadata } from './song-created.event';

export class SongPublished extends BaseEvent {
    type = 'SONG_PUBLISHED';

    meta: EventRecordMetadata;

    constructor(command: PublishSong, eventId: AggregateId) {
        super(command, eventId);
    }
}
