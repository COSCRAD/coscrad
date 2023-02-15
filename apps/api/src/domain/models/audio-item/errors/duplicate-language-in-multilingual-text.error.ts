import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateLanguageInMultilingualTextError extends InternalError {
    constructor(languageCode: LanguageCode) {
        super(`Multiple translations were specified for the following language: ${languageCode}`);
    }
}
