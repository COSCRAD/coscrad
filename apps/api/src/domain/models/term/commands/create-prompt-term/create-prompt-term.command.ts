import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { TermCompositeIdentifier } from '../create-term';
import { CREATE_PROMPT_TERM } from './constants';

@Command({
    type: CREATE_PROMPT_TERM,
    label: 'Create Prompt Term',
    description: 'Create a new Prompt Term in the language',
})
export class CreatePromptTerm implements ICommandBase {
    @NestedDataType(TermCompositeIdentifier, {
        label: 'composite ID (generated)',
        description: 'system-wide unique identifier for the new term',
    })
    aggregateCompositeIdentifier: TermCompositeIdentifier;

    @NonEmptyString({
        label: 'text',
        description: 'text for the term (in English)',
    })
    /**
     * Note that this is assumed to be English. If we have a group that wants to
     * use a different prompt language, we will have to version this event and
     * upgrade old ones to have a
     * ```ts
     * languageCode: LanguageCode;
     * ```
     */
    text: string;
}
