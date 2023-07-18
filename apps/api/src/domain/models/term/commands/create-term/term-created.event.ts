import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_CREATED } from './constants';

export class TermCreated extends BaseEvent {
    type = TERM_CREATED;
}
