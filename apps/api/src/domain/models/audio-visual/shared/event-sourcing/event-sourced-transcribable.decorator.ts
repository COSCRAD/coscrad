import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { LineItemTranslated, TranslationsImportedForTranscript } from '../commands';
import { LineItemAddedToTranscript } from '../commands/transcripts/add-line-item-to-transcript/line-item-added-to-transcript.event';
import { ParticipantAddedToTranscript } from '../commands/transcripts/add-participant-to-transcript/participant-added-to-transcript.event';
import { TranscriptCreated } from '../commands/transcripts/create-transcript/transcript-created.event';
import { LineItemsImportedToTranscript } from '../commands/transcripts/import-line-items-to-transcript/line-items-imported-to-transcript.event';
import { TranscriptItem } from '../entities/transcript-item.entity';
import { TranscriptParticipant } from '../entities/transcript-participant';

const transcriptEventHandlers = {
    handleTranscriptCreated(_: TranscriptCreated) {
        return this.createTranscript();
    },

    handleParticipantAddedToTranscript({
        payload: { name, initials },
    }: ParticipantAddedToTranscript) {
        return this.addParticipantToTranscript(
            new TranscriptParticipant({
                initials,
                name,
            })
        );
    },

    handleLineItemAddedToTranscript({
        payload: { inPointMilliseconds, outPointMilliseconds, text, languageCode, speakerInitials },
    }: LineItemAddedToTranscript) {
        // TODO Consider changing the following API
        return this.addLineItemToTranscript(
            new TranscriptItem({
                inPointMilliseconds,
                outPointMilliseconds,
                text: buildMultilingualTextWithSingleItem(text, languageCode),
                speakerInitials,
            })
        );
    },

    handleLineItemTranslated({
        payload: { inPointMilliseconds, outPointMilliseconds, translation, languageCode },
    }: LineItemTranslated) {
        return this.translateLineItem(
            inPointMilliseconds,
            outPointMilliseconds,
            translation,
            languageCode
        );
    },

    handleLineItemsImportedToTranscript({ payload: { lineItems } }: LineItemsImportedToTranscript) {
        return this.importLineItemsToTranscript(
            lineItems.map((lineItem) => ({
                ...lineItem,
                inPoint: lineItem.inPointMilliseconds,
                outPoint: lineItem.outPointMilliseconds,
                text: buildMultilingualTextWithSingleItem(lineItem.text, lineItem.languageCode),
            }))
        );
    },

    handleTranslationsImportedForTranscript({
        payload: { translationItems },
    }: TranslationsImportedForTranscript) {
        return this.importTranslationsForTranscript(
            translationItems.map(({ inPointMilliseconds, translation, languageCode }) => ({
                inPointMilliseconds,
                languageCode,
                text: translation,
            }))
        );
    },
};

/**
 * Given that event handlers are called via magic property keys `handle{EventCtorName}`,
 * we can use decorators for mixins without any loss of static type safety.
 */
export function EventSourcedTranscribable(): ClassDecorator {
    return function (target: Object) {
        // @ts-expect-error It's not worth the effort to tighten up the types here as the surface area of this decorator is tiny
        Object.assign(target.prototype, transcriptEventHandlers);
    };
}
