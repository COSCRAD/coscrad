import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../entities';

export class CannotAddPhotographForMissingPageError extends InternalError {
    constructor(pageIdentifier: PageIdentifier, photographId: AggregateId) {
        const msg = `You cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.photograph,
            id: photographId,
        })} to page: ${pageIdentifier}, as this page does not exist`;

        super(msg);
    }
}
