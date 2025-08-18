import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class CannotExceedMemoryMatchRoundCapacityError extends InternalError {
    constructor(roundId: AggregateId, size: number, actualNumberOfCards: number) {
        const msg = [
            `Memory Match Round ${roundId}`,
            `has too many cards.`,
            `Its size is ${size}`,
            `but it has ${actualNumberOfCards} cards.`,
        ].join(' ');

        super(msg);
    }
}
