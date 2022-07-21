import { InternalError } from '../../../../lib/errors/InternalError';
import { TimeRangeWithoutData } from '../../../models/context/time-range-context/time-range-context.entity';

export default class InvalidChronologicallyOrderedTimeRangeError extends InternalError {
    constructor({ inPoint, outPoint }: TimeRangeWithoutData) {
        const msg = [
            `Invalid chronological order in time range:`,
            `in: ${inPoint}`,
            `out: ${outPoint}`,
        ].join('');

        super(msg);
    }
}
