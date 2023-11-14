import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateLabelForVocabularyListFilterPropertyValueError extends InternalError {
    constructor(name: string, label: string, value: unknown) {
        const msg = `You cannot register the label: ${label} for the value: ${value} of the vocabulary list filter property: ${name}, as there is already another value with this label`;

        super(msg);
    }
}
