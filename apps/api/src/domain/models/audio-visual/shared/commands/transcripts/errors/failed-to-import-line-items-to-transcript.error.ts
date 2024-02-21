import { InternalError } from '../../../../../../../lib/errors/InternalError';

export class FailedToImportLineItemsToTranscriptError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(`Failed to import line items`, innerErrors);
    }
}
