import { InternalError } from '../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResourceCompositeIdentifier } from '../types/ResourceCompositeIdentifier';

export default class ResourceNotYetPublishedError extends InternalError {
    constructor(compositeIdentifier: ResourceCompositeIdentifier) {
        const msg = `you cannot unpublish ${formatAggregateCompositeIdentifier(
            compositeIdentifier
        )} as it is not yet published`;

        super(msg);
    }
}
