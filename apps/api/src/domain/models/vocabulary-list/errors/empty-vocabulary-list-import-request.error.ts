import { InternalError } from '../../../../lib/errors/InternalError';

export class EmptyVocabularyListImportRequestError extends InternalError {
    constructor() {
        super(`you must provide at least one item when importing entries to a vocabulary list`);
    }
}
