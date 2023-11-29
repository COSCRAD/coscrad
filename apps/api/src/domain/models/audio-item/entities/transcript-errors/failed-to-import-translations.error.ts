import { InternalError } from '../../../../../lib/errors/InternalError';

export class FailedToImportTranslationsToTranscriptError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        const msg = `Failed to import translations to an existing transcript`;

        super(msg, innerErrors);
    }
}
