import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class FailedToRemoveCardMemoryMatchRoundError extends InternalError {
    constructor(cardId: AggregateId) {
        const msg = `You cannot remove ${formatAggregateCompositeIdentifier(
            buildMemoryRoundCompositeId(cardId)
        )} as it is in the published round`;

        super(msg);
    }
}
