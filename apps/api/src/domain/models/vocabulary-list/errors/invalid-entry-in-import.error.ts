import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';

export class InvalidVocabularyListEntryInImportError extends InternalError {
    constructor(termId, innerErrors: InternalError[]) {
        super(
            `failed to add an entry for ${formatAggregateCompositeIdentifier({
                type: AggregateType.term,
                id: termId,
            })}`,
            innerErrors
        );
    }
}
