import { InternalError } from '../../../../lib/errors/InternalError';

export default class TermHasNoTextInAnyLanguageError extends InternalError {
    constructor(tagId?: string) {
        const message = [`No text provided for tag`, tagId ? `with ID ${tagId}` : ``].join(' ');

        super(message);
    }
}
