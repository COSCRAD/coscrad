import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class CannotOverrideAudioForTermError extends InternalError {
    constructor(termId: AggregateId, audioItemId: AggregateId) {
        const msg = `you cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.audioItem,
            id: audioItemId,
        })} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })}, as this term already has audio`;

        super(msg);
    }
}
