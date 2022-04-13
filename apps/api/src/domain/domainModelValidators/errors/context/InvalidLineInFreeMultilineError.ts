import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidLineInFreeMultilineError extends InternalError {
    constructor(indexOfInvalidLine: number, innerErrors?: InternalError[]) {
        const msg = [
            `Encountered an invalid line`,
            `at index: ${indexOfInvalidLine}`,
            `as part of a free multiline context`,
        ].join(' ');

        super(msg, innerErrors);
    }
}
