import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';

export default class DisallowedContextTypeForResourceError extends InternalError {
    constructor(contextType: unknown, resourceCompositeIdentifier: AggregateCompositeIdentifier) {
        super(
            `Disallowed context type: ${contextType} for resource ${formatAggregateCompositeIdentifier(
                resourceCompositeIdentifier
            )}`
        );
    }
}
