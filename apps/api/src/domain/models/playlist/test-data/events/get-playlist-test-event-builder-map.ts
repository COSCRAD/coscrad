import { EventBuilder } from '../../../../../test-data/events/test-event-stream';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import {
    buildAudioItemAddedToPlaylist,
    buildAudioItemsImportedToPlaylist,
    buildPlaylistCreated,
    buildPlaylistNameTranslated,
} from './builders';

export const getPlaylistTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set(`PLAYLIST_CREATED`, buildPlaylistCreated)
        .set(`PLAYLIST_NAME_TRANSLATED`, buildPlaylistNameTranslated)
        .set(`AUDIO_ITEM_ADDED_TO_PLAYLIST`, buildAudioItemAddedToPlaylist)
        .set(`AUDIO_ITEMS_IMPORTED_TO_PLAYLIST`, buildAudioItemsImportedToPlaylist);
