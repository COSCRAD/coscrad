import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { formatLanguageCode } from '../../../../queries/presentation/formatLanguageCode';
import { AggregateId } from '../../../types/AggregateId';
import { PageIdentifier } from '../entities';

export class CannotAddAudioForMissingContentError extends InternalError {
    constructor(
        pageIdentifier: PageIdentifier,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ) {
        const msg = [
            `You cannot add audio (${audioItemId}) for page: ${pageIdentifier}`,
            `as there is no content in the target language: ${formatLanguageCode(languageCode)}`,
        ].join(' ');

        super(msg);
    }
}
