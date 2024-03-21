import { InternalError } from '../../../../lib/errors/InternalError';

export class NotALeapYearError extends InternalError {
    constructor(year: number) {
        super(`February 29, ${year} is an invalid date, as ${year} is not a leap year`);
    }
}
