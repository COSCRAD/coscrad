import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ElicitTermFromPrompt } from './elicit-term-from-prompt.command';

export type TermElicitedFromPromptPayload = ElicitTermFromPrompt;

@CoscradEvent('TERM_ELICITED_FROM_PROMPT')
export class TermElicitedFromPrompt extends BaseEvent<TermElicitedFromPromptPayload> {
    readonly type = 'TERM_ELICITED_FROM_PROMPT';
}
