import { BaseEvent } from '../../../shared/events/base-event.entity';
import { LYRICS_ADDED_FOR_SONG } from '../translate-song-lyrics/constants';

export class LyricsAddedForSong extends BaseEvent {
    readonly type = LYRICS_ADDED_FOR_SONG;
}
