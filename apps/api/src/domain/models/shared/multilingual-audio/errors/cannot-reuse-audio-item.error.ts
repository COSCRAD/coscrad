import { AggregateType } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';

export class CannotReuseAudioItemError extends InternalError {
    constructor(audioItemId: AggregateId) {
        super(
            `${formatAggregateCompositeIdentifier({
                type: AggregateType.audioItem,
                id: audioItemId,
            })} is already in use by this resource`
        );
    }
}
