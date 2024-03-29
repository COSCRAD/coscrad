import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';

export class MissingPageError extends InternalError {
    constructor(pageIdentifier: string, digitalTextId: AggregateId) {
        const msg = `You cannot manage content for page: ${pageIdentifier} in ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.digitalText,
                id: digitalTextId,
            }
        )} as this page does not exist`;

        super(msg);
    }
}
