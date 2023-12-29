import { IUpdateEventHandler } from '../../../../../domain/common';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { AudioAddedForTerm } from '../../commands';
import { Term } from '../term.entity';

// TODO Make sure we fail more gracefully \ explicitly when we forget to decorate an event handler
@CoscradEventHandler({
    eventType: 'AUDIO_ADDED_FOR_TERM',
    scope: 'UPDATE',
})
export class AudioAddedForTermEventHandler implements IUpdateEventHandler<Term> {
    handle(updateEvent: AudioAddedForTerm, term: Term): Term | Error {
        const { audioItemId, languageCode } = updateEvent.payload;

        const result = term.addEventToHistory(updateEvent).addAudio(audioItemId, languageCode);

        return result;
    }
}
