import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';

@CoscradDataExample<RegisterPromptForExistingTerm>({
    example: {
        aggregateCompositeIdentifier: {
            id: buildDummyUuid(3),
            type: AggregateType.term,
        },
        text: 'Text for the prompt.',
    },
})
@Command({
    type: 'REGISTER_PROMPT_FOR_EXISTING_TERM',
    label: 'Register prompt for existing term',
    description: 'register prompt for a existing term',
})
export class RegisterPromptForExistingTerm implements ICommandBase {
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
     * English only for now
     */
    text: string;
}
