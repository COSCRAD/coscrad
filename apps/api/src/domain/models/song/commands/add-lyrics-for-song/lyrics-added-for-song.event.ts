import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { LYRICS_ADDED_FOR_SONG } from '../translate-song-lyrics/constants';

@CoscradEvent(LYRICS_ADDED_FOR_SONG)
export class LyricsAddedForSong extends BaseEvent {
    readonly type = LYRICS_ADDED_FOR_SONG;
}
