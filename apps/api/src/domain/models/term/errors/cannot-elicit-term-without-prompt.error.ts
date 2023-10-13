import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class CannotElicitTermWithoutPromptError extends InternalError {
    constructor(termId: AggregateId) {
        super(
            `You cannot elicit a prompted translation of ${formatAggregateCompositeIdentifier({
                id: termId,
                type: AggregateType.term,
            })} as it is not a prompt term`
        );
    }
}
