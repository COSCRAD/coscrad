import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { AggregateId } from '../../../types/AggregateId';

export class PromptLanguageMustBeUniqueError extends InternalError {
    constructor(termId: AggregateId, languageCode: LanguageCode) {
        // TODO Use a label for the language here
        super(
            `You cannot translate prompt term ${termId} into the same language (${languageCode}) as its prompt`
        );
    }
}
