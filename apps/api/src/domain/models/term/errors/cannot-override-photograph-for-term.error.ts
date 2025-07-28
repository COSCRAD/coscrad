import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class CannotOverridePhotographForTermError extends InternalError {
    constructor(
        termId: AggregateId,
        photographIdToAdd: AggregateId,
        existingPhotographId: AggregateId
    ) {
        const msg = `You cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.photograph,
            id: photographIdToAdd,
        })} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })}, as it already has ${formatAggregateCompositeIdentifier({
            type: AggregateType.photograph,
            id: existingPhotographId,
        })}`;

        super(msg);
    }
}
