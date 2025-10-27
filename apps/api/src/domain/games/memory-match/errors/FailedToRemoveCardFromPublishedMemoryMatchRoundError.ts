import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class FailedToRemoveCardFromPublishedMemoryMatchRoundError extends InternalError {
    constructor(cardId: AggregateId, sequenceNumber: number) {
        const msg = `You cannot remove card #${sequenceNumber} as its round ${formatAggregateCompositeIdentifier(
            buildMemoryRoundCompositeId(cardId)
        )} is currently published`;

        super(msg);
    }
}
