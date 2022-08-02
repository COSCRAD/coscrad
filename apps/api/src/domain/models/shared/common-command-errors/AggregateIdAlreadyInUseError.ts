import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../view-models/presentation/formatAggregateType';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export default class AggregateIdAlraedyInUseError extends InternalError {
    constructor({ id, type }: AggregateCompositeIdentifier) {
        super(`The id: ${id} is already in use by another ${formatAggregateType(type)}`);
    }
}
