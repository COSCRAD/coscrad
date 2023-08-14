import { InternalError } from '../../../../lib/errors/InternalError';

export default class VocabularyListWithNoEntriesCannotBePublishedError extends InternalError {
    constructor(vocabularyListId?: string) {
        const message = [
            `You cannot publish vocabulary list `,
            vocabularyListId ? `with ID ${vocabularyListId}` : ``,
            `as it has no entries`,
        ].join(' ');

        super(message);
    }
}
