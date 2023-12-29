import { IUpdateEventHandler } from '../../../../../../src/domain/common/events/build-event-handler-maps';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { TermTranslated } from '../../commands';
import { Term } from '../term.entity';

@CoscradEventHandler({
    eventType: 'TERM_TRANSLATED',
    scope: 'UPDATE',
})
export class TermTranslatedEventHandler implements IUpdateEventHandler<Term> {
    handle(updateEvent: TermTranslated, term: Term): Term | Error {
        const { translation, languageCode } = updateEvent.payload;

        // TODO add the event to the history at a higher level
        return term.addEventToHistory(updateEvent).translate(translation, languageCode);
    }
}
