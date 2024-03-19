import { InternalError } from '../../../../lib/errors/InternalError';
import { CoscradDate } from './coscrad-date.entity';

export class DayOfMonthTooLargeError extends InternalError {
    constructor(date: CoscradDate, max: number) {
        super(
            `Invalid date: ${date.toString()}, the day: ${
                date.day
            } exceeds the last day of the month: ${max}`
        );
    }
}
