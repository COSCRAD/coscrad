import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { formatLanguageCode } from '../../../../queries/presentation/formatLanguageCode';

export class DuplicateDigitalTextTitleError extends InternalError {
    constructor(title: string, languageCode: LanguageCode) {
        // TODO format the language code
        const msg = `You cannot create a digital text with the title: ${title} ( ${formatLanguageCode(
            languageCode
        )}), as there is already a digital text with that title in that language`;

        super(msg);
    }
}
