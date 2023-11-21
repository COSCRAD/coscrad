import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class FailedToAnalyzeVocabularyListEntryError extends InternalError {
    constructor(termId: AggregateId, vocabularyListId: AggregateId, innerErrors: InternalError[]) {
        const msg = `Failed to analyze entry for ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })} in ${formatAggregateCompositeIdentifier({
            type: AggregateType.vocabularyList,
            id: vocabularyListId,
        })}`;

        super(msg, innerErrors);
    }
}
