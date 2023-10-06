import { ICommandBase, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../../domain/common/entities/multilingual-text';
import { TermCompositeIdentifier } from '../create-term';
import { ELICIT_TERM_FROM_PROMPT } from './constants';

@Command({
    type: ELICIT_TERM_FROM_PROMPT,
    label: 'Elicit Term From Prompt',
    description: 'elicit a term from the prompt',
})
export class ElicitTermFromPrompt implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'composite ID (generated)',
        description: 'system-wide unique identifier for the new term',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NonEmptyString({
        label: 'text',
        description: 'text for the term (in the language)',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'language for the term',
    })
    languageCode: LanguageCode;
}
