import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';
import { buildMemoryRoundCompositeId } from './build-memory-round-composite-id';

export class CannotExceedMemoryMatchRoundCapacityError extends InternalError {
    constructor(roundId: AggregateId, size: number, actualNumberOfCards: number) {
        const msg = [
            buildMemoryRoundCompositeId(roundId),
            `has too many cards.`,
            `Its size is ${size}`,
            `but it has ${actualNumberOfCards} cards.`,
        ].join(' ');

        super(msg);
    }
}
