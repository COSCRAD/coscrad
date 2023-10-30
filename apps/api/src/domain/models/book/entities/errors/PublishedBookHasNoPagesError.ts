import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { AggregateType } from '../../../../types/AggregateType';

export default class PublishedBookHasNoPagesError extends InternalError {
    constructor() {
        super(`A ${formatAggregateType(AggregateType.book)} cannot be published without pages`);
    }
}
