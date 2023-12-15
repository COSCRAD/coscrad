import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../entities';

export class CannotOverrideAudioForPageError extends InternalError {
    constructor(
        pageIdentifier: PageIdentifier,
        newAudioItemId: AggregateId,
        existingAudioItemId: AggregateId
    ) {
        const msg = `You cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.audioItem,
            id: newAudioItemId,
        })} for page: ${pageIdentifier}, as it already has ${formatAggregateCompositeIdentifier({
            type: AggregateType.audioItem,
            id: existingAudioItemId,
        })}`;

        super(msg);
    }
}
