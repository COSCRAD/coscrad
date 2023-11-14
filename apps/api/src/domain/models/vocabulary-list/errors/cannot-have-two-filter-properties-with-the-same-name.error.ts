import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class CannotHaveTwoFilterPropertiesWithTheSameNameError extends InternalError {
    constructor(name: string, vocabularyListId: AggregateId) {
        const msg = `You cannot add a new filter property named: ${name} to ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.vocabularyList,
                id: vocabularyListId,
            }
        )}, as there is already a filter property with this name`;

        super(msg);
    }
}
