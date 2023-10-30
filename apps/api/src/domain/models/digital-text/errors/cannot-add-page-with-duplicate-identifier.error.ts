import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../entities';

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
