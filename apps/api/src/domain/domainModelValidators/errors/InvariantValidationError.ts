import { InternalError } from '../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';

export default class InvariantValidationError extends InternalError {
    constructor(compositeIdentifier: AggregateCompositeIdentifier, innerErrors: InternalError[]) {
        super(
            `Encountered an invalid DTO for ${formatAggregateCompositeIdentifier(
                compositeIdentifier
            )}`,
            innerErrors
        );
    }
}
