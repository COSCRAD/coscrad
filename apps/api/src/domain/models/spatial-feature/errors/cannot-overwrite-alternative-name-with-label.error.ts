import { InternalError } from '../../../../lib/errors/InternalError';
import { MultilingualText } from '../../../common/entities/multilingual-text';

export class CannotOverwriteAlternativeNameWithLabelError extends InternalError {
    constructor(
        newAlternativeName: MultilingualText,
        spatialFeatureName: MultilingualText,
        conflictingLabel: string,
        existingAlternativeName: MultilingualText
    ) {
        const msg = `You cannot add alternative name: ${
            newAlternativeName.getOriginalTextItem().text
        } for spatial feature: ${
            spatialFeatureName.getOriginalTextItem().text
        } as there is already an alternative name (${
            existingAlternativeName.getOriginalTextItem().text
        }) with this label (${conflictingLabel}) .`;
        super(msg);
    }
}
