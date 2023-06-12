import { BaseEvent } from '../../../shared/events/base-event.entity';

export class PlaylistNameTranslated extends BaseEvent {
    readonly type = 'PLAYLIST_NAME_TRANSLATED';
}
