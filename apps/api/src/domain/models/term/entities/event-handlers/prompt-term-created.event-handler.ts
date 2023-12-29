import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { ICreationEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CoscradEventHandler } from '../../../../../domain/common/events/coscrad-event-handler.decorator';
import { MultilingualAudio } from '../../../shared/multilingual-audio/multilingual-audio.entity';
import { PromptTermCreated } from '../../commands';
import { Term } from '../term.entity';

@CoscradEventHandler({
    eventType: 'PROMPT_TERM_CREATED',
    scope: 'CREATE',
})
export class PromptTermCreatedEventHandler implements ICreationEventHandler<Term> {
    // Shouldn't this run invariant validation and possibly return an error?
    handle(creationEvent: PromptTermCreated): Term {
        const {
            payload: {
                aggregateCompositeIdentifier: { id },
                text,
            },
        } = creationEvent;

        return new Term({
            type: AggregateType.term,
            id,
            // At present, prompts are only in English
            text: buildMultilingualTextWithSingleItem(text, LanguageCode.English),
            isPromptTerm: true,
            audio: new MultilingualAudio({
                items: [],
            }),
            // terms are not published by default
            published: false,
        }).addEventToHistory(creationEvent);
    }
}
