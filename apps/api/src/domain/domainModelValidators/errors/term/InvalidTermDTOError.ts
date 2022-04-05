import { InternalError } from 'apps/api/src/lib/errors/InternalError';

export default class InvalidTermDTOError extends InternalError {
    constructor(termId?: string, innerErrors: InternalError[] = []) {
        const message = [
            `Received an invalid DTO`,
            termId ? `for the term with ID ${termId}` : ``,
        ].join(' ');

        super(message, innerErrors);
    }
}
