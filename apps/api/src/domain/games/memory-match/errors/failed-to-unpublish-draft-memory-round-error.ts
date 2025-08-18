import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class FailedToUnpublishDraftMemoryMatchRoundError extends InternalError {
    constructor(roundId: AggregateId) {
        const msg = `You cannot unpublish memory round ${roundId} as it is not yet published`;

        super(msg);
    }
}
