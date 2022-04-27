import { Maybe } from 'apps/api/src/lib/types/maybe';
import { NotFound } from 'apps/api/src/lib/types/not-found';
import { DTO } from 'apps/api/src/types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';

// We can change this later
type MediaTimestamp = number;

// Update later
type MediaData = string;

export class MediaTimeRange extends BaseDomainModel {
    readonly inPoint: MediaTimestamp;

    readonly outPoint: MediaTimestamp;

    readonly data?: MediaData;

    constructor({ inPoint, outPoint, data }: DTO<MediaTimeRange>) {
        super();

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
