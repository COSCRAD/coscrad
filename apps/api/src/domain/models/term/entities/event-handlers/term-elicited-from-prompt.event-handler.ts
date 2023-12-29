import { IUpdateEventHandler } from '../../../../../domain/common';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { TermElicitedFromPrompt } from '../../commands';
import { Term } from '../term.entity';

@CoscradEventHandler({
    eventType: 'TERM_ELICITED_FROM_PROMPT',
    scope: 'UPDATE',
})
export class TermElicitedFromPromptEventHandler implements IUpdateEventHandler<Term> {
    handle(updateEvent: TermElicitedFromPrompt, term: Term): Term | Error {
        const { text, languageCode } = updateEvent.payload;

        return term.addEventToHistory(updateEvent).elicitFromPrompt(text, languageCode);
    }
}
