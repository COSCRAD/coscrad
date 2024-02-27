import { EventBuilder } from '../../../../../../test-data/events';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { buildAudioItemCreated } from './builders';

export const getAudioItemTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>().set('AUDIO_ITEM_CREATED', buildAudioItemCreated);
