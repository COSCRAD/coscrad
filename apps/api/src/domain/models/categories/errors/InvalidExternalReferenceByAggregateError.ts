import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import formatArrayAsList from '../../../../queries/presentation/shared/formatArrayAsList';
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
            `invalidly references the following entities. \n`,
            ` This could be because the entities don't exist,`,
            ` or because their state is inconsistent.`,
            formatArrayAsList(invalidReferences, (ref) => formatAggregateCompositeIdentifier(ref)),
        ].join(' ');

        super(msg, innerErrors);
    }
}
