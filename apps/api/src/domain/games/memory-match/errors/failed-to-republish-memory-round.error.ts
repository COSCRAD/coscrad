import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class FailedToRepublishMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId) {
        const msg = `You cannot publish ${formatAggregateCompositeIdentifier(
            buildMemoryRoundCompositeId(roundId)
        )} as it is already published`;

        super(msg);
    }
}
