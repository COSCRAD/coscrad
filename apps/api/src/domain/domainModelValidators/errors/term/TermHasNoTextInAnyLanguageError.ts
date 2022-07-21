import { InternalError } from '../../../../lib/errors/InternalError';

export default class TermHasNoTextInAnyLanguageError extends InternalError {
    constructor(termId?: string) {
        const message = [
            `Term`,
            termId ? `with ID ${termId}` : ``,
            `has no text in either language`,
        ].join(' ');

        super(message);
    }
}
