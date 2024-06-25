import { ITranscriptItem, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { isNonEmptyString, isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { Maybe } from '../../../../../lib/types/maybe';
import { NotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { DeepPartial } from '../../../../../types/DeepPartial';
import { ResultOrError } from '../../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../base-domain-model.entity';

import { InvalidTimestampOrderError } from '../commands/transcripts/errors';
import {
    CannotOverrideTranslationError,
    EmptyTranslationForTranscriptItem,
} from '../transcript-errors';

// We can change this later
type MediaTimestamp = number;

export class TranscriptItem extends BaseDomainModel implements ITranscriptItem {
    @NonNegativeFiniteNumber({
        label: 'in point',
        description: 'starting time stamp (ms)',
    })
    readonly inPointMilliseconds: MediaTimestamp;

    @NonNegativeFiniteNumber({
        label: 'out point',
        description: 'ending time stamp (ms)',
    })
    readonly outPointMilliseconds: MediaTimestamp;

    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'multi-lingual text transcription \\ translation for this item',
    })
    readonly text: MultilingualText;

    @NonEmptyString({
        label: 'label',
        description: 'the label for the current timestamped item',
    })
    readonly speakerInitials: string;

    constructor(dto: DTO<TranscriptItem>) {
        super();

        if (!dto) return;

        const {
            inPointMilliseconds: inPoint,
            outPointMilliseconds: outPoint,
            text: data,
            speakerInitials: label,
        } = dto;

        this.inPointMilliseconds = inPoint;

        this.outPointMilliseconds = outPoint;

        if (data) this.text = new MultilingualText(data);

        this.speakerInitials = label;
    }

    translate<T extends TranscriptItem>(
        this: T,
        text: string,
        languageCode: LanguageCode
    ): ResultOrError<TranscriptItem> {
        if (!isNonEmptyString(text)) return new EmptyTranslationForTranscriptItem();

        if (this.text.has(languageCode)) {
            const { languageCode: existingLanguageCode, text: existingTranslation } =
                this.text.getTranslation(languageCode) as MultilingualTextItem;

            return new CannotOverrideTranslationError(
                text,
                languageCode,
                existingTranslation,
                existingLanguageCode
            );
        }

        const updatedText = this.text.translate({
            languageCode,
            text,
            role: MultilingualTextItemRole.freeTranslation,
        });

        return this.clone<T>({
            text: updatedText as MultilingualText,
        } as DeepPartial<DTO<T>>);
    }

    hasData(): boolean {
        return !isNullOrUndefined(this.text);
    }

    getData(): Maybe<MultilingualText> {
        return this.hasData() ? this.text : NotFound;
    }

    setData<T extends MultilingualText>(newData: T) {
        return this.clone<TranscriptItem>({
            data: newData,
        } as unknown as TranscriptItem);
    }

    getTimeBounds(): [number, number] {
        return [this.inPointMilliseconds, this.outPointMilliseconds];
    }

    conflictsWith({
        inPointMilliseconds,
        outPointMilliseconds,
    }: Pick<TranscriptItem, 'inPointMilliseconds' | 'outPointMilliseconds'>): boolean {
        return [inPointMilliseconds, outPointMilliseconds].some((point) =>
            isNumberWithinRange(point, this.getTimeBounds())
        );
    }

    isColocatedWith({
        inPointMilliseconds,
        outPointMilliseconds,
    }: Pick<TranscriptItem, 'inPointMilliseconds' | 'outPointMilliseconds'>) {
        return (
            this.inPointMilliseconds === inPointMilliseconds &&
            this.outPointMilliseconds === outPointMilliseconds
        );
    }

    toString() {
        const {
            inPointMilliseconds: inPoint,
            outPointMilliseconds: outPoint,
            text,
            speakerInitials,
        } = this;

        // TODO remove ? chaining
        return `[${inPoint}] [${speakerInitials}] ${text?.toString()} [${outPoint}]`;
    }

    validateComplexInvariants(): ResultOrError<Valid> {
        const allErrors: InternalError[] = [];

        if (this.inPointMilliseconds > this.outPointMilliseconds)
            allErrors.push(new InvalidTimestampOrderError(this));

        const textValidationResult = this.text.validateComplexInvariants();

        if (isInternalError(textValidationResult)) allErrors.push(textValidationResult);

        return allErrors.length > 0
            ? new InternalError(`Encountered an invalid transcript line item`, allErrors)
            : Valid;
    }
}
