import { InternalError } from '../../../../../lib/errors/InternalError';

export class CannotTranslateEmptyTranscriptError extends InternalError {
    constructor() {
        super(`This transcript has no line items to translate`);
    }
}
