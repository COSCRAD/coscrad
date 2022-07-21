import { InternalError } from '../../../../lib/errors/InternalError';

export default class MediaItemHasNoTitleInAnyLanguageError extends InternalError {
    constructor(id: string) {
        const msg = `Media item: ${id} does not have a title in any language`;

        super(msg);
    }
}
