import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class FailedToRepublishMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId) {
        const msg = `You cannot publish memory round ${roundId} as it is already published`;

        super(msg);
    }
}
