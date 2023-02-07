import { InternalError } from '../../../../lib/errors/InternalError';
import { TranscriptItem } from '../entities/transcript-item.entity';

export class ConflictingLineItemsError extends InternalError {
    constructor(newLineItem: TranscriptItem, conflictingExistingItems: TranscriptItem[]) {
        super(
            `You cannot add the new line item: ${newLineItem.toString()} to this transcript as its time stamp conflicts with those of the following existing line item(s):\n${conflictingExistingItems
                .map((existingItem) => existingItem.toString())
                .join('\n')}`
        );
    }
}
