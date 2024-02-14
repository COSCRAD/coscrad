import { EventBuilder } from '../../../../../test-data/events';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { buildPhotographCreated } from './builders';

export const getPhotographTestEventBuilders = () =>
    new Map<string, EventBuilder<BaseEvent>>().set('PHOTOGRAPH_CREATED', buildPhotographCreated);
