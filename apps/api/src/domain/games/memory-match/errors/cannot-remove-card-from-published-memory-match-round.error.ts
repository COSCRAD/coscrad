import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { MEMORY_MATCH_ROUND } from '../constants';

export class CannotRemoveCardFromPublishedMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId, sequenceNumber: number) {
        const msg = `You cannot remove card ${sequenceNumber} from ${formatAggregateCompositeIdentifier(
            {
                type: MEMORY_MATCH_ROUND,
                id: roundId,
            }
        )}, as it is already published`;

        super(msg);
    }
}
