import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_TITLE_TRANSLATED } from './constants';
import { TranslateSongTitle } from './translate-song-title.command';

export type SongTitleTranslatedPayload = TranslateSongTitle;

// TODO Can we get the event type via reflection?
@CoscradEvent(SONG_TITLE_TRANSLATED)
export class SongTitleTranslated extends BaseEvent<SongTitleTranslatedPayload> {
    readonly type = SONG_TITLE_TRANSLATED;
}
