import { InternalError } from '../../../../lib/errors/InternalError';
import { TranscriptItem } from '../entities/transcript-item.entity';

// TODO Move this to a utils directory. We can deal with irregular plurals if we hit the need
const pluralizeArrayName = (array: Array<unknown>, singularName: string): string =>
    array.length > 0 ? `${singularName}s` : singularName;

export class ConflictingLineItemsError extends InternalError {
    constructor(newLineItem: TranscriptItem, conflictingExistingItems: TranscriptItem[]) {
        super(
            `You cannot add the new line item: ${newLineItem.toString()} to this transcript as its time stamp conflicts with those of the following ${pluralizeArrayName(
                conflictingExistingItems,
                'existing line item'
            )}:\n${conflictingExistingItems
                .map((existingItem) => existingItem.toString())
                .join('\n')}`
        );
    }
}
