import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateValueForVocabularyListFilterPropertyValueError extends InternalError {
    constructor(name: string, label: string, value: unknown) {
        const msg = `You cannot register the value: ${value} (label: ${label}) for the vocabulary list filter property: ${name}, as this value has already been registered`;

        super(msg);
    }
}
