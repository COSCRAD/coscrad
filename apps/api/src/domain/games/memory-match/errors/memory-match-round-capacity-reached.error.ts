import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class MemoryMatchRoundCapacityReachedError extends InternalError {
    constructor(roundId: AggregateId, maxNumberOfCards: number) {
        const msg = [
            `You cannot add another card to`,
            `memory match round ${roundId}`,
            `as it already has the maximum number of cards [${maxNumberOfCards}]`,
        ].join(' ');

        super(msg);
    }
}
