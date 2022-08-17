import { InternalError } from '../../../lib/errors/InternalError';
import { AggregateType } from '../../types/AggregateType';

export default class NullOrUndefinedAggregateDTOError extends InternalError {
    constructor(aggregateType: AggregateType) {
        const message = [
            `A null or undefined DTO was provided`,
            aggregateType ? `for entity of type ${aggregateType}` : ``,
        ].join(' ');

        super(message);
    }
}
