import { BaseEvent } from '../../../shared/events/base-event.entity';
import { PROMPT_TERM_CREATED } from './constants';

export class PromptTermCreated extends BaseEvent {
    type = PROMPT_TERM_CREATED;
}
