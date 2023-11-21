import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';

export class VocabularyListFilterPropertyNotFoundError extends InternalError {
    constructor(propertyName: string, vocabularyListId: string) {
        const msg = `There is no vocabulary list filter property with the name: ${propertyName} in vocabulary list: ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            }
        )}`;

        super(msg);
    }
}
