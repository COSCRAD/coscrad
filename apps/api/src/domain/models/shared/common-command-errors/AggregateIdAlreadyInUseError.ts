import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../queries/presentation/formatAggregateType';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export default class AggregateIdAlreadyInUseError extends InternalError {
    constructor({ id, type }: AggregateCompositeIdentifier) {
        super(`The id: ${id} is already in use by another ${formatAggregateType(type)}`);
    }
}
