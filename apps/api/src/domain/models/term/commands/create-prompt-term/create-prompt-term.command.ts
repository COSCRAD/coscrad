import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { TermCompositeIdentifier } from '../create-term';
import { CREATE_PROMPT_TERM } from './constants';

@CoscradDataExample<CreatePromptTerm>({
    example: {
        aggregateCompositeIdentifier: {
            id: buildDummyUuid(1),
            type: AggregateType.term,
        },
        text: 'I am drinking cold water.',
        // this is optional, provide it in the overrides to a clone util if needed
        rawData: null,
    },
})
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

    @RawDataObject({
        isOptional: true,
        label: 'raw data',
        description: 'additional data from a legacy \\ third-party system source of the data',
    })
    readonly rawData?: Record<string, unknown>;

    public static fromDto(dto: DTO<CreatePromptTerm>) {
        return dto;
    }
}
