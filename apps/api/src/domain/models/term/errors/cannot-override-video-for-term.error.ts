import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class CannotOverrideVideoForTermError extends InternalError {
    constructor(termId: AggregateId, videoIdToAdd: AggregateId, existingVideoId: AggregateId) {
        const msg = `You cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.video,
            id: videoIdToAdd,
        })} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })}, as it already has ${formatAggregateCompositeIdentifier({
            type: AggregateType.video,
            id: existingVideoId,
        })}`;

        super(msg);
    }
}
