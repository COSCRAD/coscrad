import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { formatLanguageCode } from '../../../../../queries/presentation/formatLanguageCode';

export class LineItemNotFoundForTranslationError extends InternalError {
    constructor(inPointMilliseconds: number, translationText: string, languageCode: LanguageCode) {
        super(
            `Failed to apply the translation: ${translationText} (${formatLanguageCode(
                languageCode
            )}), as there is no line item with the in point (ms): ${inPointMilliseconds}`
        );
    }
}
