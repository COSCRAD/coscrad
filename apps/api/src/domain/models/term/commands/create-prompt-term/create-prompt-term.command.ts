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
        description: 'text for the term (in the language)',
    })
    text: string;

    @NonEmptyString({
        isOptional: true,
        label: 'contributor ID',
        description: 'The ID of the konwledge kepper who contributed the term',
    })
    contributorId?: string;
}
