import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';

export class MultipleOriginalsInMultilingualTextError extends InternalError {
    constructor(languageCodes: LanguageCode[]) {
        super(
            `Encountered a multilingual text item with multiple original languages: ${languageCodes.join(
                ','
            )}`
        );
    }
}
