import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class DuplicateSequeneceNumberForCardsError extends InternalError {
    constructor(roundId: AggregateId, duplicateSequenceNumber: number) {
        const msg = [
            `memory match round ${roundId}`,
            `has multiple cards with the sequence number ${duplicateSequenceNumber}`,
        ].join(' ');

        super(msg);
    }
}
