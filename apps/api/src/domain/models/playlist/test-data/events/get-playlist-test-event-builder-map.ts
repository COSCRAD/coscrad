import { EventBuilder } from '../../../../../test-data/events/test-event-stream';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { buildPlaylistCreated } from './builders';
import { buildPlaylistNameTranslated } from './builders/build-playlist-name-translated';

export const getPlaylistTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set(`PLAYLIST_CREATED`, buildPlaylistCreated)
        .set(`PLAYLIST_NAME_TRANSLATED`, buildPlaylistNameTranslated);
