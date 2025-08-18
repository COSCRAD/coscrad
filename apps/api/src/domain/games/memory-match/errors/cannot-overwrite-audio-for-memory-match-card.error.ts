import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';

export class CannotOverwriteAudioForMemoryMatchCardError extends InternalError {
    constructor(roundId, cardSequenceNumber, existingAudoId, newAudioId) {
        const msg = [
            `You cannot add`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: existingAudoId,
            }),
            `to memory round: ${roundId} (card: ${cardSequenceNumber})`,
            `as it already has the audio`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: newAudioId,
            }),
        ].join(' ');

        super(msg);
    }
}
