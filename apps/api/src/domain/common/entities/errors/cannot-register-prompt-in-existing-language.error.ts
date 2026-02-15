import { LanguageCode } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { formatLanguageCode } from '../../../../queries/presentation/formatLanguageCode';

export class CannotRegisterPromptInExistingLanguageError extends InternalError {
    constructor(existingLanguageCode: LanguageCode, promptText: string) {
        super(
            `You cannot register the prompt: ${promptText} as there is already text for the language: ${formatLanguageCode(
                existingLanguageCode
            )}`
        );
    }
}
