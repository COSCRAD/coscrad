import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ImportAudioItemsToPlaylist } from './import-audio-items-to-playlist.command';

export type AudioItemsImportedToPlaylistPayload = ImportAudioItemsToPlaylist;

@CoscradEvent('AUDIO_ITEMS_IMPORTED_TO_PLAYLIST')
export class AudioItemsImportedToPlaylist extends BaseEvent<AudioItemsImportedToPlaylistPayload> {
    readonly type = 'AUDIO_ITEMS_IMPORTED_TO_PLAYLIST';
}
