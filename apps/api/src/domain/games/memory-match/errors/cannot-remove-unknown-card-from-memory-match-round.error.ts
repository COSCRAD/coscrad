import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class CannotRemoveUnknownCardFromMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId, sequenceNumber: number) {
        const msg = `You cannot remove card ${sequenceNumber} as there is no such card in ${formatAggregateCompositeIdentifier(
            buildMemoryRoundCompositeId(roundId)
        )}`;

        super(msg);
    }
}
