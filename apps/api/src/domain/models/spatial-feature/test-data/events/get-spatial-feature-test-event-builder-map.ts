import { EventBuilder } from '../../../../../test-data/events';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { buildPointCreated } from './builders';

export const getSpatialFeatureTestEventBuilderMap = () =>
    new Map<string, EventBuilder<BaseEvent>>().set('POINT_CREATED', buildPointCreated);
