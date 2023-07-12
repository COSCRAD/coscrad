import { InternalError } from '../../../../../../lib/errors/InternalError';
import { TranscriptItem } from '../../../entities/transcript-item.entity';

/**
 * This is a top-level wrapper for any errors when adding a new line item to
 * a transcript.
 */
export class CannotAddInconsistentLineItemError extends InternalError {
    constructor(lineItem: TranscriptItem, innerErrors: InternalError[]) {
        super(
            `You cannot add the following line-item as it is inconsistent: ${lineItem.toString()}`,
            innerErrors
        );
    }
}
