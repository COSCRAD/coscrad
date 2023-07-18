import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_TRANSLATED } from './constants';

export class TermTranslated extends BaseEvent {
    type = TERM_TRANSLATED;
}
