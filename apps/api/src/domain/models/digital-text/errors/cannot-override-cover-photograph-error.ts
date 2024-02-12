import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class CannotOverrideCoverPhotographError extends InternalError {
    constructor(photographId: AggregateId) {
        const msg = `You cannot override ${formatAggregateCompositeIdentifier({
            type: AggregateType.photograph,
            id: photographId,
        })} to digital text, as the cover photograph does not exist`;

        super(msg);
    }
}
