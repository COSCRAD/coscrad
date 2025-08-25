import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { formatMemoryMatchCardCompositeIdentifier } from './format-memory-card-composite-id';

export class CannotOverwriteAudioForMemoryMatchCardError extends InternalError {
    constructor(
        roundId: AggregateId,
        cardSequenceNumber: number,
        existingAudioId: AggregateId,
        newAudioId: AggregateId
    ) {
        const msg = [
            `You cannot add`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: newAudioId,
            }),
            formatMemoryMatchCardCompositeIdentifier(roundId, cardSequenceNumber),
            `as it already has the audio`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: existingAudioId,
            }),
        ].join(' ');

        super(msg);
    }
}
