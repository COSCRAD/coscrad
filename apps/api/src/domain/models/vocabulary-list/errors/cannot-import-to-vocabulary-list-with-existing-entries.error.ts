import { InternalError } from '../../../../lib/errors/InternalError';

export class CannotImportToVocabularyListWithExistingEntriesError extends InternalError {
    constructor() {
        super(`you cannot import entries to a vocabulary list that already has entries`);
    }
}
