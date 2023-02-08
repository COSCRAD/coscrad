import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { isNumberWithinRange } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { MultiLingualText } from '../../../common/entities/multi-lingual-text';
import { Valid } from '../../../domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { InvalidTimestampOrderError } from '../errors';

// We can change this later
type MediaTimestamp = number;

export class TranscriptItem extends BaseDomainModel {
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

    @NestedDataType(MultiLingualText, {
        label: 'text',
        description: 'multi-lingual text transcription \\ translation for this item',
    })
    readonly text: MultiLingualText;

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

        if (data) this.text = new MultiLingualText(data);

        this.speakerInitials = label;
    }

    hasData(): boolean {
        return !isNullOrUndefined(this.text);
    }

    getData(): Maybe<MultiLingualText> {
        return this.hasData() ? this.text : NotFound;
    }

    setData<T extends MultiLingualText>(newData: T) {
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
        const { inPoint, outPoint, text } = this;

        return `[${inPoint}] ${text.toString()} [${outPoint}]`;
    }

    validateInvariants(): ResultOrError<Valid> {
        const allErrors: InternalError[] = [];

        if (this.inPoint > this.outPoint) allErrors.push(new InvalidTimestampOrderError(this));

        return allErrors.length > 0
            ? new InternalError(`Encountered an invalid transcript line item`, allErrors)
            : Valid;
    }
}
