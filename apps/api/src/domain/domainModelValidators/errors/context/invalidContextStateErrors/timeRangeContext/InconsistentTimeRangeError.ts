import { TimeRangeWithoutData } from 'apps/api/src/domain/models/context/time-range-context/time-range-context.entity';
import { TimeBoundable } from 'apps/api/src/domain/models/interfaces/TimeBoundable';
import { Resource } from 'apps/api/src/domain/models/resource.entity';
import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import formatTimeRange from 'apps/api/src/view-models/presentation/formatTimeRange';

export default class InconsistentTimeRangeError extends InternalError {
    constructor(timeRange: TimeRangeWithoutData, resource: TimeBoundable & Resource) {
        const [inPoint, outPoint] = resource.getTimeBounds();

        const resourceTimeBounds: TimeRangeWithoutData = {
            inPoint,
            outPoint,
        };

        const msg = [
            `Time range: ${formatTimeRange(timeRange)}`,
            `is outside the bounds of`,
            `resource: ${resource.getCompositeIdentifier}.`,
            '\n',
            `Time range should fall within the bounds: ${formatTimeRange(resourceTimeBounds)}`,
        ].join(' ');

        super(msg);
    }
}
