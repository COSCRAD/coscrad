import { EventBuilder } from '../../../../../test-data/events/test-event-stream';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { buildPlaylistCreated } from './builders';

export const getPlaylistTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>().set(`PLAYLIST_CREATED`, buildPlaylistCreated);
