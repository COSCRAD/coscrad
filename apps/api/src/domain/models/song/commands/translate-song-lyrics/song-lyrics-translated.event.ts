import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_LYRICS_TRANSLATED } from './constants';

@CoscradEvent(SONG_LYRICS_TRANSLATED)
export class SongLyricsTranslated extends BaseEvent {
    type = SONG_LYRICS_TRANSLATED;
}
