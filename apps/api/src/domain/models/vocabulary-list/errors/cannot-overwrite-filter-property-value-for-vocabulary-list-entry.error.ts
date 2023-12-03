import { InternalError } from '../../../../lib/errors/InternalError';

export class CannotOverwriteFilterPropertyValueForVocabularyListEntryError extends InternalError {
    constructor(
        propertyName: string,
        propertyValue: string | boolean,
        existingValue: string | boolean
    ) {
        const msg = `You cannot assign the value: ${propertyValue} to the filter property: ${propertyName} for this entry, as it already has the value: ${existingValue}`;

        super(msg);
    }
}
