import { EventBuilder } from '../../../../../../test-data/events';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { buildVideoCreated, buildVideoNameTranslated } from './builders';

export const getVideoTestEventBuilder = () =>
    new Map<string, EventBuilder<BaseEvent>>()
        .set('VIDEO_CREATED', buildVideoCreated)
        .set('VIDEO_NAME_TRANSLATED', buildVideoNameTranslated);
