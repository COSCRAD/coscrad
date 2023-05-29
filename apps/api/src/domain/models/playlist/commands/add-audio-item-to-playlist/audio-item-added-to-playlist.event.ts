import { BaseEvent } from '../../../shared/events/base-event.entity';

export class AudioItemAddedToPlaylist extends BaseEvent {
    readonly type = 'AUDIO_ITEM_ADDED_TO_PLAYLIST';
}
