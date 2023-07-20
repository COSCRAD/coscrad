import { BaseEvent } from '../../../shared/events/base-event.entity';
import { POINT_CREATED } from './constants';

export class PointCreated extends BaseEvent {
    type = POINT_CREATED;
}
