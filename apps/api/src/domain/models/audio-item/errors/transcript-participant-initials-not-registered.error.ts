import { InternalError } from '../../../../lib/errors/InternalError';

export class TranscriptParticipantInitialsNotRegisteredError extends InternalError {
    constructor(initials: string) {
        super(`there is no participant registered with the initials: ${initials}`);
    }
}
