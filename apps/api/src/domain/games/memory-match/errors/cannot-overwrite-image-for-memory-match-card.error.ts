import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';

export class CannotOverwriteImageForMemoryMatchCardError extends InternalError {
    constructor(roundId, cardSequenceNumber, existingImageId, newImageId) {
        const msg = [
            `You cannot add`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: existingImageId,
            }),
            `to memory round: ${roundId} (card: ${cardSequenceNumber})`,
            `as it already has the image`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: newImageId,
            }),
        ].join(' ');

        super(msg);
    }
}
