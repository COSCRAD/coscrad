import { LanguageCode } from '@coscrad/api-interfaces';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { TranscriptItem } from '../entities/transcript-item.entity';

import { Transcript } from '../entities/transcript.entity';
import { NoTranslationsProvidedError, TranscriptDoesNotExistError } from '../transcript-errors';

export type LineItemTranslation = Pick<TranscriptItem, 'inPointMilliseconds'> & {
    text: string;
    languageCode: LanguageCode;
};

interface Transcribable {
    transcript: Transcript;
    hasTranscript(): boolean;
}

export function importTranslationsForTranscriptImplementation<T extends Transcribable & Resource>(
    this: T,
    translationItemDtos: LineItemTranslation[]
): ResultOrError<T> {
    if (translationItemDtos.length === 0) {
        return new NoTranslationsProvidedError();
    }

    if (!this.hasTranscript())
        return new TranscriptDoesNotExistError(this.getCompositeIdentifier());

    const transcriptUpdateResult = this.transcript.importTranslations(translationItemDtos);

    if (isInternalError(transcriptUpdateResult)) {
        return transcriptUpdateResult;
    }

    this.transcript = transcriptUpdateResult;

    return this;
}
