import { AggregateType } from '@coscrad/api-interfaces';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { ICreationEventHandler } from '../../../../../domain/common/events/build-event-handler-maps';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { TermCreated } from '../../commands';
import { Term } from '../term.entity';

@CoscradEventHandler({
    eventType: 'TERM_CREATED',
    // TODO Wrap this decorator in a second `@CoscradCreateEventHandler`.
    scope: 'CREATE',
})
// TODO Consider adding a second generic to `ICreationEventHandler` for the concrete event.
export class TermCreatedEventHandler implements ICreationEventHandler<Term> {
    handle(creationEvent: TermCreated): Term {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                text,
                languageCode,
                contributorId,
            },
        } = creationEvent;

        return new Term({
            type: AggregateType.term,
            id,
            text: buildMultilingualTextWithSingleItem(text, languageCode),
            contributorId,
            // Terms are not published by default
            published: false,
            audio: new MultilingualAudio({
                items: [],
            }),
            // Oh no! We need to find a way to avoid writing this manually.
        }).addEventToHistory(creationEvent);
    }
}
