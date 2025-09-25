import { InternalError } from '../../../../lib/errors/InternalError';

export class MissingCardBackErrorForMemoryMatchRound extends InternalError {
    constructor() {
        super(`A memory match round must have an image for the back of its cards`);
    }
}
