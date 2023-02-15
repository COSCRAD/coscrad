import { ITranscriptItem } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { InvalidTimestampOrderError } from '../errors';

// We can change this later
type MediaTimestamp = number;

export class TranscriptItem extends BaseDomainModel implements ITranscriptItem {
    @NonNegativeFiniteNumber({
        label: 'in point',
        description: 'starting time stamp',
    })
    readonly inPoint: MediaTimestamp;

    @NonNegativeFiniteNumber({
        label: 'out point',
        description: 'ending time stamp',
    })
    readonly outPoint: MediaTimestamp;

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

        const { inPoint, outPoint, text: data, speakerInitials: label } = dto;

        this.inPoint = inPoint;

        this.outPoint = outPoint;

        if (data) this.text = new MultilingualText(data);

        this.speakerInitials = label;
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
        return [this.inPoint, this.outPoint];
    }

    conflictsWith({ inPoint, outPoint }: Pick<TranscriptItem, 'inPoint' | 'outPoint'>): boolean {
        return [inPoint, outPoint].some((point) =>
            isNumberWithinRange(point, this.getTimeBounds())
        );
    }

    toString() {
        const { inPoint, outPoint, text, speakerInitials } = this;

        // todo remove ? chaining
        return `[${inPoint}] [${speakerInitials}] ${text?.toString()} [${outPoint}]`;
    }

    validateComplexInvariants(): ResultOrError<Valid> {
        const allErrors: InternalError[] = [];

        if (this.inPoint > this.outPoint) allErrors.push(new InvalidTimestampOrderError(this));

        const textValidationResult = this.text.validateComplexInvariants();

        if (isInternalError(textValidationResult)) allErrors.push(textValidationResult);

        return allErrors.length > 0
            ? new InternalError(`Encountered an invalid transcript line item`, allErrors)
            : Valid;
    }
}
