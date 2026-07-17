import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';

export class AlternativeNameMatchesOriginalError extends InternalError {
    constructor(text: string, languageCode: LanguageCode, label: string) {
        const msg = `You cannot add alternative name ${text} with label ${label}, as the original name already has this text for the language ${languageCode}`;

        super(msg);
    }
}
