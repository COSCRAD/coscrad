import { InternalError } from '../../../lib/errors/InternalError';
import { TimeRangeContext } from '../../models/context/time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import EmptyTimeRangeContextError from '../errors/context/EmptyTimeRangeContextError';
import InvalidChronologicallyOrderedTimeRangeError from '../errors/context/InvalidChronologicallyOrderedTimeRangeError';
import InvalidEdgeConnectionContextError from '../errors/context/InvalidEdgeConnectionContextError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { Valid } from '../Valid';

export const timeRangeContextValidator = (input: unknown): Valid | InternalError => {
    if (isNullOrUndefined(input))
        return new NullOrUndefinedEdgeConnectionContextDTOError(
            EdgeConnectionContextType.timeRange
        );

    const allErrors: InternalError[] = [];

    const { timeRange } = input as TimeRangeContext;

    // Exit early if this fails, as further validation depends on this existing
    if (isNullOrUndefined(timeRange))
        return new InvalidEdgeConnectionContextError(
            EdgeConnectionContextType.timeRange,
            allErrors.concat(new EmptyTimeRangeContextError())
        );

    const { inPoint, outPoint } = timeRange;

    // It's ok if they are equal. This is how we tag a single point in a media file
    if (outPoint < inPoint)
        allErrors.push(new InvalidChronologicallyOrderedTimeRangeError(timeRange));

    return allErrors.length > 0
        ? new InvalidEdgeConnectionContextError(EdgeConnectionContextType.timeRange, allErrors)
        : Valid;
};
