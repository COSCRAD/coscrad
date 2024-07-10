import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { formatLanguageCode } from '../../../../queries/presentation/formatLanguageCode';
import { AggregateId } from '../../../types/AggregateId';

export class CannotAddAudioForNoteInGivenLanguageError extends InternalError {
    constructor(
        edgeConnectionId: AggregateId,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ) {
        const msg = `you cannot add the audio: ${audioItemId} for ${formatAggregateCompositeIdentifier(
            {
                type: AggregateType.note,
                id: edgeConnectionId,
            }
        )} as it has no translation of the note in ${formatLanguageCode(languageCode)}`;

        super(msg);
    }
}
