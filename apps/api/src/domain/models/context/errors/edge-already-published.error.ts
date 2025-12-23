import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class EdgeAlreadyPublishedError extends InternalError {
    constructor(id: AggregateId) {
        const msg = `You cannot publish ${formatAggregateCompositeIdentifier({
            type: AggregateType.note,
            id,
        })}, as it is already published`;

        super(msg);
    }
}
