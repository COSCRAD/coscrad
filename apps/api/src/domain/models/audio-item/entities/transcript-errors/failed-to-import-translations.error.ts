import { InternalError } from '../../../../../lib/errors/InternalError';

export class FailedToImportLineItemsToTranscriptError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        const msg = `Failed to import translations to an existing transcript`;

        super(msg, innerErrors);
    }
}
