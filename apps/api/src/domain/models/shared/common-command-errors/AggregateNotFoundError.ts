import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import formatAggregateType from '../../../../queries/presentation/formatAggregateType';
import { isResourceType } from '../../../types/ResourceType';

type CompId = {
    type: string;
    id: string;
};

export default class AggregateNotFoundError extends InternalError {
    constructor({ type, id }: CompId) {
        super(
            `Failed to update ${
                isResourceType(type) ? 'resource' : ''
            }: ${formatAggregateCompositeIdentifier({
                id,
                type,
            })} as there is no ${formatAggregateType(type as AggregateType)} with that ID`
        );
    }
}
