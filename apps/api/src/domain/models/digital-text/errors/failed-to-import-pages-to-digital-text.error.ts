import { AggregateType } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';

export class FailedToImportPagesToDigitalTextError extends InternalError {
    constructor(digitalTextId: AggregateId, innerErrors: InternalError[]) {
        const msg = [
            `Failed to import pages to`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.digitalText,
                id: digitalTextId,
            }),
        ].join(' ');

        super(msg, innerErrors);
    }
}
