import { InternalError } from '../../../../../../../lib/errors/InternalError';

export class InvalidTranscriptError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Encountered an invalid transcript`, innerErrors);
    }
}
