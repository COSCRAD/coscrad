import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import formatAggregateType from '../../../../queries/presentation/formatAggregateType';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { isResourceType } from '../../../types/ResourceType';

export default class AggregateNotFoundError extends InternalError {
    constructor({ type, id }: AggregateCompositeIdentifier) {
        super(
            `Failed to update ${
                isResourceType(type) ? 'resource' : ''
            }: ${formatAggregateCompositeIdentifier({
                id,
                type,
            })} as there is no ${formatAggregateType(type)} with that ID`
        );
    }
}
