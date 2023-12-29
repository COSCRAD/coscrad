import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { InternalError } from '../../../../../lib/errors/InternalError';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { formatLanguageCode } from '../../../../../queries/presentation/formatLanguageCode';

export class CannotOverrideAudioForLanguageError extends InternalError {
    constructor(
        languageCode: LanguageCode,
        audioItemId: AggregateId,
        existingAudioItemId: AggregateId
    ) {
        const msg = [
            `You cannot add`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.audioItem,
                id: audioItemId,
            }),
            `for the language:`,
            formatLanguageCode(languageCode),
            `as it already has`,
            formatAggregateCompositeIdentifier({
                type: AggregateType.audioItem,
                id: existingAudioItemId,
            }),
        ].join(' ');

        super(msg);
    }
}
