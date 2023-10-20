import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../../book/entities/types/PageIdentifier';

export class CannotAddPageWithDuplicateIdentifierError extends InternalError {
    constructor(digitalTextId: AggregateId, pageIdentifier: PageIdentifier) {
        super(
            [
                `Cannot add page with duplicate identifier "${pageIdentifier}" to`,
                `${formatAggregateCompositeIdentifier({
                    type: AggregateType.digitalText,
                    id: digitalTextId,
                })} because there is already a page with this identifier`,
            ].join(' ')
        );
    }
}
