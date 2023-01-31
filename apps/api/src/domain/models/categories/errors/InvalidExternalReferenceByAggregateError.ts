import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import formatArrayAsList from '../../../../view-models/presentation/shared/formatArrayAsList';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';

export default class InvalidExternalReferenceByAggregateError extends InternalError {
    /**
     * Why do we pass the entire aggregate in here? Why not just `HasGetCompositeIdentifier`?
     * Further, why do we build the composite identifier on the other side for the
     * `invalidReferences`? This is inconsistent.
     */
    constructor(
        aggregateCompositeIdentifier: AggregateCompositeIdentifier,
        invalidReferences: AggregateCompositeIdentifier[],
        /**
         * Sometimes the reference is invalid not because the related aggregate
         * doesn't exist, but because its state is wrong (e.g. media item has
         * invalid MIME type)
         */
        innerErrors?: InternalError[]
    ) {
        const msg = [
            `${formatAggregateCompositeIdentifier(aggregateCompositeIdentifier)}`,
            `references the following composite keys, which don't exist`,
            formatArrayAsList(invalidReferences, (ref) => formatAggregateCompositeIdentifier(ref)),
        ].join(' ');

        super(msg, innerErrors);
    }
}
