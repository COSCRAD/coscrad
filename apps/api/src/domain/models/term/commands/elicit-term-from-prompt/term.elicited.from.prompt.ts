import { BaseEvent } from '../../../shared/events/base-event.entity';
import { TERM_ELICITED_FROM_PROMPT } from './constants';

export class TermElicitedFromPrompt extends BaseEvent {
    type = TERM_ELICITED_FROM_PROMPT;
}
