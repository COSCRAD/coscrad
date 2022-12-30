import { InternalError } from '../../lib/errors/InternalError';
import formatResourceCompositeIdentifier from '../../view-models/presentation/formatAggregateCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';

/**
 * TODO Move this to an `Errors` directory.
 */
export default class ResourceAlreadyPublishedError extends InternalError {
    constructor(compositeIdentifier: ResourceCompositeIdentifier) {
        const msg = `You cannot publish ${formatResourceCompositeIdentifier(
            compositeIdentifier
        )} as it is already published`;

        super(msg);
    }
}
