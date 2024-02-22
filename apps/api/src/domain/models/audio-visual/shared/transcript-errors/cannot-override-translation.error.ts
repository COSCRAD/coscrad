import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { formatLanguageCode } from '../../../../../queries/presentation/formatLanguageCode';

export class CannotOverrideTranslationError extends InternalError {
    constructor(
        newTranslation: string,
        newLanguageCode: LanguageCode,
        existingText: string,
        existingLanguageCode: LanguageCode
    ) {
        const msg = `You cannot add the translation: ${newTranslation} (${formatLanguageCode}), as there is already a translation: ${existingText} (${formatLanguageCode(
            existingLanguageCode
        )}))`;

        super(msg);
    }
}
