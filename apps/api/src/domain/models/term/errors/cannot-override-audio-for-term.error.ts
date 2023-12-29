import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { CannotOverrideAudioForLanguageError } from '../../shared/multilingual-audio/errors';

export class CannotOverrideAudioForTermError extends InternalError {
    constructor(
        termId: AggregateId,
        languageCode: LanguageCode,
        audioItemId: AggregateId,
        existingAudioItemId: AggregateId
    ) {
        const msg = `you cannot add ${formatAggregateCompositeIdentifier({
            type: AggregateType.audioItem,
            id: audioItemId,
        })} to ${formatAggregateCompositeIdentifier({
            type: AggregateType.term,
            id: termId,
        })}, as this term already has audio`;

        const innerErrors = [
            new CannotOverrideAudioForLanguageError(languageCode, audioItemId, existingAudioItemId),
        ];

        super(msg, innerErrors);
    }
}
