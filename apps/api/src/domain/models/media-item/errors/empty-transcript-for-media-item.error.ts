import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class EmptyTranscriptForMediaItemError extends InternalError {
    constructor(mediaItemId: AggregateId) {
        super(
            `${formatAggregateCompositeIdentifier({
                type: AggregateType.mediaItem,
                id: mediaItemId,
            })} should not have an empty transcript`
        );
    }
}
