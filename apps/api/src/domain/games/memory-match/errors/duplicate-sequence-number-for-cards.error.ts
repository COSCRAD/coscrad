import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { formatMemoryRoundCompositeId } from './format-memory-round-composite-id';

export class DuplicateSequeneceNumberForCardsError extends InternalError {
    constructor(roundId: AggregateId, duplicateSequenceNumber: number) {
        const msg = [
            formatMemoryRoundCompositeId(roundId),
            `has multiple cards with the sequence number ${duplicateSequenceNumber}`,
        ].join(' ');

        super(msg);
    }
}
