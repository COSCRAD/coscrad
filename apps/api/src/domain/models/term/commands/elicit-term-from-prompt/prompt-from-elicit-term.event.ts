import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PROMPT_FROM_ELICIT_TERM } from './constants';

export class PromptFromElicitTerm extends BaseEvent {
    type = PROMPT_FROM_ELICIT_TERM;
}
