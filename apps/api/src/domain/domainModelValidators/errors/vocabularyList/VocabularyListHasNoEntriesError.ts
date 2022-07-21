import { InternalError } from '../../../../lib/errors/InternalError';

export default class VocabularyListHasNoEntriesError extends InternalError {
    constructor(vocabularyListId?: string) {
        const message = [
            `Vocabulary list`,
            vocabularyListId ? `with ID ${vocabularyListId}` : ``,
            `has no entries`,
        ].join(' ');

        super(message);
    }
}
