import { InternalError } from '../../../../lib/errors/InternalError';

export class MultilingualTextHasNoOriginalError extends InternalError {
    constructor() {
        super(`Multilingual text must have one text item that is designated as the original`);
    }
}
