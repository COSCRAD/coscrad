import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class FailedToUpdateMissingMemoryMatchCardError extends InternalError {
    constructor(roundId: AggregateId, cardSequenceNumber: number) {
        const msg = [
            `Failed to update memory match round: ${roundId} (card: ${cardSequenceNumber})`,
            `as there is no card with that sequence number.`,
        ].join(' ');

        super(msg);
    }
}
