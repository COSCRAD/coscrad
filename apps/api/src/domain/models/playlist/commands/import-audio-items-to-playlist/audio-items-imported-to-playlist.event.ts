import { BaseEvent } from '../../../shared/events/base-event.entity';

export class AudioItemsImportedToPlaylist extends BaseEvent {
    readonly type = 'AUDIO_ITEMS_IMPORTED_TO_PLAYLIST';
}
