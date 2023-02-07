import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export class CannotAddParticipantBeforeCreatingTranscriptError extends InternalError {
    constructor(aggregateCompositeIdentifier: AggregateCompositeIdentifier) {
        super(
            `You must add a transcript for ${formatAggregateCompositeIdentifier(
                aggregateCompositeIdentifier
            )} prior to adding transcript participants`
        );
    }
}
