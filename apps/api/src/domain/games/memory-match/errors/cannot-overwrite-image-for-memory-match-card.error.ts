import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { formatMemoryMatchCardCompositeIdentifier } from './format-memory-card-composite-id';

export class CannotOverwriteImageForMemoryMatchCardError extends InternalError {
    constructor(roundId, cardSequenceNumber, existingImageId, newImageId) {
        const msg = [
            `You cannot add`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: existingImageId,
            }),
            formatMemoryMatchCardCompositeIdentifier(roundId, cardSequenceNumber),
            `as it already has the image`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: newImageId,
            }),
        ].join(' ');

        super(msg);
    }
}
