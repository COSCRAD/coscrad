import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class CannotPromptFromExistingPromptTerm extends InternalError {
    constructor(termId: AggregateId) {
        super(
            `You cannot register a prompt for ${formatAggregateCompositeIdentifier({
                id: termId,
                type: AggregateType.term,
            })} as it already has a prompt`
        );
    }
}
