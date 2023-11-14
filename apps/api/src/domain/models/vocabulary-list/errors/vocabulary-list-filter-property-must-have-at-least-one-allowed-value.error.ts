import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class VocabularyListFilterPropertyMustHaveAtLeastOneAllowedValueError extends InternalError {
    constructor(vocabularyListId: AggregateId, filterPropertyName: string) {
        const msg = `
        Failed to register filter property: ${filterPropertyName} for vocabulary list: ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            }
        )}
        `;

        super(msg);
    }
}
