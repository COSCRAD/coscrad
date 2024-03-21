import { InternalError } from '../../../../lib/errors/InternalError';

export class InvalidDateError extends InternalError {
    constructor(input: string) {
        super(`failed to parse date from user input: ${input}`);
    }
}
