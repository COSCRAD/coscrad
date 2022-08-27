import { InternalError } from '../../../lib/errors/InternalError';
import InvariantValidationError from '../../domainModelValidators/errors/InvariantValidationError';
import { AggregateId } from '../../types/AggregateId';
import { AggregateType } from '../../types/AggregateType';

type InvariantValidationErrorFactoryFunction = (
    id: AggregateId,
    innerErrors: InternalError[]
) => InternalError;

export default (aggregateType: AggregateType): InvariantValidationErrorFactoryFunction =>
    (id: AggregateId, innerErrors: InternalError[]) =>
        new InvariantValidationError({ type: aggregateType, id }, innerErrors);
