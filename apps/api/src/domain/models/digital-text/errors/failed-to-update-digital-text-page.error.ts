import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateType } from '../../../types/AggregateType';
import { PageIdentifier } from '../entities';

/**
 * This is a top level error and provides the context of which digital text was
 * the subject of the failed update. You need to flow through the internal errors
 * related to the page \ content.
 */
export class FailedToUpdateDigitalTextPageError extends InternalError {
    constructor(
        pageIdentifier: PageIdentifier,
        digitalTextId: string,
        innerErrors: InternalError[]
    ) {
        const msg = `Failed to update page content for page: ${pageIdentifier} in ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.digitalText,
                id: digitalTextId,
            }
        )}`;

        super(msg, innerErrors);
    }
}
