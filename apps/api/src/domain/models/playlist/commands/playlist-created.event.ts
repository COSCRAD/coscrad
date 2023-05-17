import { BaseEvent } from '../../shared/events/base-event.entity';

export class playlistCreated extends BaseEvent {
    type = 'PLAYLIST_CREATED';
}
