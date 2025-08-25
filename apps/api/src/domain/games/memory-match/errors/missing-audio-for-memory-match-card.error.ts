import { InternalError } from '../../../../lib/errors/InternalError';

export class MissingAudioForMemoryMatchCardError extends InternalError {
    constructor(cardSequenceNumber: number) {
        super(`memory match card ${cardSequenceNumber} does not have audio`);
    }
}
