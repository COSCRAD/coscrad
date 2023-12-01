import { InternalError } from '../../../../../lib/errors/InternalError';

export class NoTranslationsProvidedError extends InternalError {
    constructor() {
        super(
            `When importing translations, you must provided a translation for at least one transcript item`
        );
    }
}
