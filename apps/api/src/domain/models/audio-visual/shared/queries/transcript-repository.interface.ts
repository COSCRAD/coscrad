import { AggregateId } from '../../../../../domain/types/AggregateId';
import { TranslationLineItemDto } from '../../audio-item/queries/audio-item-query-repository.interface';
import { TranscriptLineItemDto, TranslationItem } from '../commands';
import { TranscriptParticipant } from '../entities/transcript-participant';

export interface ITranscriptRepository {
    createTranscript(id: AggregateId): Promise<void>;

    addParticipant(id: AggregateId, { name, initials }: TranscriptParticipant);

    addLineItem(
        id: AggregateId,
        {
            speakerInitials,
            inPointMilliseconds,
            outPointMilliseconds,
            text,
            languageCode,
        }: TranscriptLineItemDto
    ): Promise<void>;

    importLineItems(id: AggregateId, lineItems: TranscriptLineItemDto[]);

    translateLineItem(
        id: AggregateId,
        // TODO Consider whether the out point is actually necessary here
        { languageCode, text, inPointMilliseconds, outPointMilliseconds }: TranslationLineItemDto
    );

    importTranslationsForTranscript(
        id: AggregateId,
        translations: TranslationItem[]
    ): Promise<void>;
}
