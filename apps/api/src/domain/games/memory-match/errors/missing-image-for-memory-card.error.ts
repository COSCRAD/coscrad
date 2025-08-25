import { InternalError } from '../../../../lib/errors/InternalError';

export class MissingImageForMemoryMatchCardError extends InternalError {
    constructor(cardSequenceNumber: number) {
        super(`memory match card ${cardSequenceNumber} does not have an image`);
    }
}
