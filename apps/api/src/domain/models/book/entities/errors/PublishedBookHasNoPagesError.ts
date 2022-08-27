import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateType from '../../../../../view-models/presentation/formatAggregateType';
import { AggregateType } from '../../../../types/AggregateType';

export default class PublishedBookHasNoPagesError extends InternalError {
    constructor() {
        super(`A ${formatAggregateType(AggregateType.book)} cannot be published without pages`);
    }
}
