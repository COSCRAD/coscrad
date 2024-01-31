import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { formatLanguageCode } from '../../../../queries/presentation/formatLanguageCode';
import { AggregateId } from '../../../types/AggregateId';

export class CannotAddAudioForTitleInGivenLanguageError extends InternalError {
    constructor(digitalTextId: AggregateId, audioItemId: AggregateId, languageCode: LanguageCode) {
        const msg = `you cannot add the audio: ${audioItemId} for ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.digitalText,
                id: digitalTextId,
            }
        )} as it has no translation of the title in ${formatLanguageCode(languageCode)}`;

        super(msg);
    }
}
