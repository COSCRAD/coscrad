import { NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';

// We can change this later
type MediaTimestamp = number;

// Update later
type CoscradText = string;

export class TranscriptItem<T extends string = string> extends BaseDomainModel {
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

    // TODO Abstract over different data types
    @NonEmptyString({
        label: 'text data',
        description: 'text for this time range',
    })
    readonly text: CoscradText;

    @NonEmptyString({
        label: 'label',
        description: 'the label for the current timestamped item',
    })
    readonly label: string;

    constructor(dto: DTO<TranscriptItem<T>>) {
        super();

        if (!dto) return;

        const { inPoint, outPoint, text: data, label } = dto;

        this.inPoint = inPoint;

        this.outPoint = outPoint;

        // TODO - clone if using a reference type for data
        if (data) this.text = data;

        this.label = label;
    }

    hasData(): boolean {
        return !isNullOrUndefined(this.text);
    }

    getData(): Maybe<CoscradText> {
        return this.hasData() ? this.text : NotFound;
    }

    setData<T extends CoscradText>(newData: T) {
        return this.clone<TranscriptItem<T>>({
            data: newData,
        } as unknown as TranscriptItem<T>);
    }
}
