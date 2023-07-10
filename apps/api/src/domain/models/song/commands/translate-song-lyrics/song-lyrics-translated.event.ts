import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_LYRICS_TRANSLATED } from './constants';

export class SongLyricsTranslated extends BaseEvent {
    type = SONG_LYRICS_TRANSLATED;
}
