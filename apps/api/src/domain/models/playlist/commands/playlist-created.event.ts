import { CoscradEvent } from '../../../common';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { CreatePlayList } from './create-playlist.command';

export type PlaylistCreatedPayload = CreatePlayList;

@CoscradEvent('PLAYLIST_CREATED')
export class PlaylistCreated extends BaseEvent<PlaylistCreatedPayload> {
    readonly type = 'PLAYLIST_CREATED';
}
