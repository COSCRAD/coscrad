import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreatePromptTerm } from './create-prompt-term.command';

export type PromptTermCreatedPayload = CreatePromptTerm;

@CoscradEvent('PROMPT_TERM_CREATED')
export class PromptTermCreated extends BaseEvent<PromptTermCreatedPayload> {
    readonly type = 'PROMPT_TERM_CREATED';
}
