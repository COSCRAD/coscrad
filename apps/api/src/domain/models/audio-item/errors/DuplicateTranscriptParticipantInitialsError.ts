import { InternalError } from '../../../../lib/errors/InternalError';

export class DuplicateTranscriptParticipantInitialsError extends InternalError {
    constructor(duplicateValue: string) {
        super(`There is already a participant with the initials: ${duplicateValue}`);
    }
}
