import { InternalError } from '../../../../../lib/errors/InternalError';

export class NoTranslationsProvidedError extends InternalError {
    constructor() {
        super(
            `When importing translations, you must provide a translation for at least one transcript item`
        );
    }
}
