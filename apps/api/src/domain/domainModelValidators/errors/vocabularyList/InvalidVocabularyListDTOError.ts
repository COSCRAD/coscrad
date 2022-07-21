import { InternalError } from '../../../../lib/errors/InternalError';

// TODO extract this and the term DTO error into a generic InvalidEntityDTOError
export default class InvalidVocabularyListDTOError extends InternalError {
    constructor(id?: string, innerErrors: InternalError[] = []) {
        const message = [
            `Received an invalid DTO`,
            id ? `for the vocabulary list with ID ${id}` : ``,
        ].join(' ');

        super(message, innerErrors);
    }
}
