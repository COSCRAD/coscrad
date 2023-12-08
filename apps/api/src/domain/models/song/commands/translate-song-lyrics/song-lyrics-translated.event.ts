import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_LYRICS_TRANSLATED } from './constants';
import { TranslateSongLyrics } from './translate-song-lyrics.command';

export type SongLyricsTranslatedPayload = TranslateSongLyrics;

@CoscradEvent(SONG_LYRICS_TRANSLATED)
export class SongLyricsTranslated extends BaseEvent<SongLyricsTranslatedPayload> {
    type = SONG_LYRICS_TRANSLATED;
}
