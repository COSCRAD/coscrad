import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TranslatePlaylistName } from './translate-playlist-name.command';

export type PlaylistNameTranslatedPayload = TranslatePlaylistName;

@CoscradEvent(`PLAYLIST_NAME_TRANSLATED`)
export class PlaylistNameTranslated extends BaseEvent<PlaylistNameTranslatedPayload> {
    readonly type = 'PLAYLIST_NAME_TRANSLATED';
}
