import { InternalError } from '../../../../lib/errors/InternalError';
import isNumberWithinRange from '../../../../lib/validation/geometry/isNumberWithinRange';
import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { Valid } from '../../../domainModelValidators/Valid';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../../interfaces/ITimeBoundable';
import { Resource } from '../../resource.entity';

export default (
    resource: ITimeBoundable & Resource,
    { timeRange: { inPoint, outPoint } }: TimeRangeContext
): InternalError | Valid => {
    if (!resource.getTimeBounds) {
        throw new Error('missing getTimeBounds method');
    }

    const isNumberOutOfRange = (n: number): boolean =>
        !isNumberWithinRange(n, resource.getTimeBounds());

    /**
     * Note that the `startMilliseconds` doesn't have to be 0, so we need to
     * confirm here that `inPoint` isn't too low.
     */
    if ([inPoint, outPoint].some(isNumberOutOfRange))
        return new InconsistentTimeRangeError({ inPoint, outPoint }, resource);

    return Valid;
};
