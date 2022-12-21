import { NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';

// We can change this later
type MediaTimestamp = number;

// Update later
type MediaData = string;

export class MediaTimeRange extends BaseDomainModel {
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

    // TODO Calling this property `data` is probably a bad idea
    // TODO Abstract over different data types
    @NonEmptyString({
        isOptional: true,
        label: 'text data',
        description: 'text for this time range',
    })
    readonly data?: MediaData;

    constructor(dto: DTO<MediaTimeRange>) {
        super();

        if (!dto) return;

        const { inPoint, outPoint, data } = dto;

        this.inPoint = inPoint;

        this.outPoint = outPoint;

        // TODO - clone if using a reference type for data
        if (data) this.data = data;
    }

    hasData(): boolean {
        return !isNullOrUndefined(this.data);
    }

    getData(): Maybe<MediaData> {
        return this.hasData() ? this.data : NotFound;
    }

    setData(newData: MediaData) {
        return this.clone<MediaTimeRange>({
            data: newData,
        });
    }
}
