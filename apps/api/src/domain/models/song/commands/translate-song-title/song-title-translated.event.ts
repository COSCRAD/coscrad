import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_TITLE_TRANSLATED } from './consants';

export class SongTitleTranslated extends BaseEvent {
    type = SONG_TITLE_TRANSLATED;
}
