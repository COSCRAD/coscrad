import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class CannotOverwriteCardbackImageForMemoryMatchRoundError extends InternalError {
    constructor(
        roundId: AggregateId,
        existingCardbackImageId: AggregateId,
        newImageId: AggregateId
    ) {
        const msg = [
            `You cannot add image`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: newImageId,
            }),
            `for memory match round: ${roundId}`,
            `as this round already has the cardback image`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: existingCardbackImageId,
            }),
        ].join(' ');

        super(msg);
    }
}
