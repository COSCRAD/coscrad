import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateTranscriptParticipantError extends InternalError {
    constructor(innerErrors: InternalError[]) {
        super(
            `You cannot add this participant to the transcript as it would introduce duplication.`,
            innerErrors
        );
    }
}
