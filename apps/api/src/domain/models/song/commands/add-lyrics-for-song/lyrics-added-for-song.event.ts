import { BaseEvent } from '../../../shared/events/base-event.entity';

export class LyricsAddedForSong extends BaseEvent {
    readonly type = 'LYRICS_ADDED_FOR_SONG';
}
