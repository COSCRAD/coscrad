import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';

export class VocabularyListEntryNotFoundError extends InternalError {
    constructor(termId: string, vocabularyListId: string) {
        const msg = `There is no entry for the term with the ID: ${termId} in vocabulary list: ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            }
        )}`;

        super(msg);
    }
}
