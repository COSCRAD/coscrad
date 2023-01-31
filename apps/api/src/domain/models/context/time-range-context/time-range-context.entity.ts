import { DiscriminatedBy } from '@coscrad/data-types';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { TranscriptItem } from '../../transcribed-audio/entities/MediaTimeRange';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

// We don't want the `data` type and we don't need OO baggage for this prop
// TODO Improve the naming
export type TimeRangeWithoutData = Pick<TranscriptItem, 'inPoint' | 'outPoint'>;

@DiscriminatedBy(EdgeConnectionContextType.general)
export class TimeRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.timeRange;

    timeRange: TimeRangeWithoutData;

    constructor({ timeRange }: DTO<TimeRangeContext>) {
        super();

        // avoid side-effects
        this.timeRange = cloneToPlainObject(timeRange);
    }
}
