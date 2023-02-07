import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateTranscriptParticipantNameError extends InternalError {
    constructor(duplicateValue: string) {
        super(`There is already a participant with the name: ${duplicateValue}`);
    }
}
