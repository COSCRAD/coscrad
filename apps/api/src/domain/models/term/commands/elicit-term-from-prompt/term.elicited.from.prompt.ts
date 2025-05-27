import { formatLanguageCode } from '../../../../../queries/presentation/formatLanguageCode';
import { CoscradEvent } from '../../../../common';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { ElicitTermFromPrompt } from './elicit-term-from-prompt.command';

export type TermElicitedFromPromptPayload = ElicitTermFromPrompt;

@CoscradEvent('TERM_ELICITED_FROM_PROMPT')
export class TermElicitedFromPrompt extends BaseEvent<TermElicitedFromPromptPayload> {
    readonly type = 'TERM_ELICITED_FROM_PROMPT';

    protected attributionTemplate = `Term provided in the language by: `;

    override buildAttributionStatement(): string {
        return `Term provided in ${formatLanguageCode(this.payload.languageCode)} by: `;
    }
}
