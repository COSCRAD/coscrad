import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { LYRICS_ADDED_FOR_SONG } from '../translate-song-lyrics/constants';
import { AddLyricsForSong } from './add-lyrics-for-song.command';

export type LyricsAddedForSongPayload = AddLyricsForSong;

@CoscradEvent(LYRICS_ADDED_FOR_SONG)
export class LyricsAddedForSong extends BaseEvent<AddLyricsForSong> {
    readonly type = LYRICS_ADDED_FOR_SONG;
}
