import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class CannotAddMultipleEntriesForSingleTermError extends InternalError {
    constructor(termId: AggregateId, vocabularyListId: AggregateId) {
        const msg = `You cannot add a duplicate entry for ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.vocabularyList,
            id: vocabularyListId,
        })}`;

        super(msg);
    }
}
