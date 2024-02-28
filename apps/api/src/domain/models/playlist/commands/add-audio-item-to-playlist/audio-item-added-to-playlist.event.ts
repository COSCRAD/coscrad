import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { AddAudioItemToPlaylist } from './add-audio-item-to-playlist.command';

export type AudioItemAddedToPlaylistPayload = AddAudioItemToPlaylist;

@CoscradEvent(`AUDIO_ITEM_ADDED_TO_PLAYLIST`)
export class AudioItemAddedToPlaylist extends BaseEvent<AddAudioItemToPlaylist> {
    readonly type = 'AUDIO_ITEM_ADDED_TO_PLAYLIST';
}
