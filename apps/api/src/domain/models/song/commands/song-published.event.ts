import { BaseEvent } from '../../shared/events/base-event.entity';

export class SongPublished extends BaseEvent {
    type = 'SONG_PUBLISHED';
}
