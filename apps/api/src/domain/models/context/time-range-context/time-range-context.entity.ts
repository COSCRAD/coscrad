import cloneToPlainObject from 'apps/api/src/lib/utilities/cloneToPlainObject';
import { DTO } from 'apps/api/src/types/partial-dto';
import { MediaTimeRange } from '../../transcribed-audio/entities/MediaTimeRange';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

// We don't want the `data` type and we don't need OO baggage for this prop
// TODO Improve the naming
export type TimeRangeWithoutData = Pick<MediaTimeRange, 'inPoint' | 'outPoint'>;

export class TimeRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.timeRange;

    timeRange: TimeRangeWithoutData;

    constructor({ timeRange }: DTO<TimeRangeContext>) {
        super();

        // avoid side-effects
        this.timeRange = cloneToPlainObject(timeRange);
    }
}
