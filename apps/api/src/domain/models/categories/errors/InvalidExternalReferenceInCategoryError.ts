import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import formatArrayAsList from '../../../../view-models/presentation/shared/formatArrayAsList';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { Aggregate } from '../../aggregate.entity';

export default class InvalidExternalReferenceByAggregateError extends InternalError {
    constructor(aggregate: Aggregate, invalidReferences: AggregateCompositeIdentifier[]) {
        const msg = [
            `${formatAggregateCompositeIdentifier(aggregate.getCompositeIdentifier())}`,
            `references the following composite keys, which don't exist`,
            formatArrayAsList(invalidReferences, (ref) => formatAggregateCompositeIdentifier(ref)),
        ].join(' ');

        super(msg);
    }
}
