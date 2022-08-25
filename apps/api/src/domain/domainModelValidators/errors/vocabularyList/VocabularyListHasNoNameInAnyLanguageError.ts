import { InternalError } from '../../../../lib/errors/InternalError';

export default class VocabularyListHasNoNameInAnyLanguageError extends InternalError {
    constructor() {
        const message = [`A vocabulary list must have a name in at least one language`].join(' ');

        super(message);
    }
}
