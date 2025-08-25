import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class FailedToUnpublishDraftMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId) {
        const msg = `You cannot unpublish ${formatAggregateCompositeIdentifier(
            buildMemoryRoundCompositeId(roundId)
        )} as it is not yet published`;

        super(msg);
    }
}
