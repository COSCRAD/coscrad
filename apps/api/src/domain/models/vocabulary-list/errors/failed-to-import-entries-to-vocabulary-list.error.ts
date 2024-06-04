import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class FailedToImportEntriesToVocabularyListError extends InternalError {
    constructor(vocabularyListId: AggregateId, innerErrors: InternalError[]) {
        super(
            `failed to import terms to ${formatAggregateCompositeIdentifier({
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            })}`,
            innerErrors
        );
    }
}
