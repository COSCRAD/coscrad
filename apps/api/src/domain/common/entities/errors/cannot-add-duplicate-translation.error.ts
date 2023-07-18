import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText, MultilingualTextItem } from '../multilingual-text';

export class CannotAddDuplicateTranslationError extends InternalError {
    constructor(newItem: MultilingualTextItem, existingMultilingualText: MultilingualText) {
        const msg = `You cannot add the item: ${newItem} as there is already a text item in this language: ${existingMultilingualText}`;

        super(msg);
    }
}
