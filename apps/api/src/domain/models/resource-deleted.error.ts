import { InternalError } from '../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';

export default class ResourceDeletedError extends InternalError {
    constructor(compositeIdentifier: ResourceCompositeIdentifier) {
        const msg = `You cannot delete ${formatResourceCompositeIdentifier(
            compositeIdentifier
        )} as it is already deleted`;

        super(msg);
    }
}
