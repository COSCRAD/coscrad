import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class InvalidVocabularyListFilterPropertyValueError extends InternalError {
    constructor(
        propertyName: string,
        propertyValue: string | boolean,
        vocabularyListId: AggregateId
    ) {
        const msg = `The value: ${propertyValue} is not an allowed value for the filter property: ${propertyName} of ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            }
        )}`;

        super(msg);
    }
}
