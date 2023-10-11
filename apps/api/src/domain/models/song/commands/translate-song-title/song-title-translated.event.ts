import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_TITLE_TRANSLATED } from './constants';

// TODO Can we get the event type via reflection?
@CoscradEvent(SONG_TITLE_TRANSLATED)
export class SongTitleTranslated extends BaseEvent {
    type = SONG_TITLE_TRANSLATED;
}
