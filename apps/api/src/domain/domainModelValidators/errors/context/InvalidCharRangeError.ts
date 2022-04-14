import { InternalError } from 'apps/api/src/lib/errors/InternalError';

const formatNumericRange = ([x, y]: [number, number]): string => `[${x},${y}]`;

export default class InvalidCharRangeError extends InternalError {
    constructor(charRange: [number, number], innerErrors?: InternalError[]) {
        const msg = `Invalid character range: ${formatNumericRange(charRange)}`;

        super(msg, innerErrors);
    }
}
