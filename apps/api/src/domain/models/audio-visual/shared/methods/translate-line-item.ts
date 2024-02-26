import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CannotAddDuplicateTranslationError } from '../../../../../domain/common/entities/errors';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { isInternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { TranscriptItem } from '../entities/transcript-item.entity';
import { Transcript } from '../entities/transcript.entity';
import { LineItemNotFoundError } from '../transcript-errors/line-item-not-found.error';

interface Transcribable {
    transcript: Transcript;
}

export function translateLineItemImplementation<T extends Transcribable & Resource>(
    this: T,
    inPointMillisecondsForTranslation: number,
    outPointMillisecondsForTranslation: number,
    translation: string,
    languageCode: LanguageCode
): ResultOrError<T> {
    if (
        !this.transcript.hasLineItem(
            inPointMillisecondsForTranslation,
            outPointMillisecondsForTranslation
        )
    )
        return new LineItemNotFoundError({
            inPointMilliseconds: inPointMillisecondsForTranslation,
            outPointMilliseconds: outPointMillisecondsForTranslation,
        });

    const existingLineItem = this.transcript.getLineItem(
        inPointMillisecondsForTranslation,
        outPointMillisecondsForTranslation
    ) as TranscriptItem;

    const newTextItem = new MultilingualTextItem({
        text: translation,
        languageCode,
        role: MultilingualTextItemRole.freeTranslation,
    });

    if (existingLineItem.text.has(languageCode))
        return new CannotAddDuplicateTranslationError(newTextItem, existingLineItem.text);

    const textUpdateResult = existingLineItem.text.translate(newTextItem);

    if (isInternalError(textUpdateResult)) return textUpdateResult;

    const newLineItem = existingLineItem.clone({
        text: textUpdateResult,
    });

    return this.safeClone({
        transcript: this.transcript.clone({
            items: this.transcript.items.map((item) =>
                item.isColocatedWith(existingLineItem) ? newLineItem : item
            ),
        }),
    } as DeepPartial<DTO<T>>);
}
