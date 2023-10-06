import { LanguageCode } from '@coscrad/api-interfaces';
import { BooleanDataType, NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import InvalidPublicationStatusError from '../../../domainModelValidators/errors/InvalidPublicationStatusError';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { CREATE_PROMPT_TERM } from '../commands/create-prompt-term/constants';
import { CREATE_TERM } from '../commands/create-term/constants';
import { TRANSLATE_TERM } from '../commands/translate-term/constants';

const isOptional = true;

@RegisterIndexScopedCommands([CREATE_TERM, CREATE_PROMPT_TERM])
export class Term extends Resource {
    readonly type: ResourceType = ResourceType.term;

    @BooleanDataType({
        // TODO Write a migration and make this prop required on incoming DTOs
        isOptional: true,
        label: 'is prompt term',
        description: 'flag for whether or not this is a prompt term',
    })
    readonly isPromptTerm?: boolean;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'text (language)',
    //     description: 'the term in the language',
    // })
    // readonly term?: string;

    // @NonEmptyString({
    //     isOptional,
    //     label: 'text (colonial language)',
    //     description: 'the text in the colonial language',
    // })
    // readonly termEnglish?: string;

    /**
     * TODO We will need a migration for this change
     */
    @NestedDataType(MultilingualText, {
        label: 'text',
        description: 'the text for the term',
    })
    readonly text: MultilingualText;

    /**
     * Note  that eventually, we will track contributions as follows. Every
     * command can be executed `onBehalfOfContributorWithId`. If this is specified,
     * the corresponding event will be attributed to the contributor with this ID.
     * Otherwise, it will be attributed to the system user.
     */
    @NonEmptyString({
        isOptional: true,
        label: 'contributor ID',
        description: 'reference to the contributor for this term',
    })
    readonly contributorId?: AggregateId;

    /**
     * TODO Make this a mediaItemId
     */
    @NonEmptyString({
        isOptional,
        label: 'Audio Filename',
        description: 'a url link to the audio file',
    })
    readonly audioFilename?: string;

    /**
     * TODO - This should be done via a tag or a note. Remove this property.
     */
    @NonEmptyString({
        isOptional,
        label: 'Source Project',
        description: 'the name of the project through which the term was collected',
    })
    readonly sourceProject?: string;

    // The constructor should only be called after validating the input DTO
    constructor(dto: DTO<Term>) {
        super({ ...dto, type: ResourceType.term });

        // This should only happen in the validation context
        if (isNullOrUndefined(dto)) return;

        const { contributorId, audioFilename, sourceProject, text, isPromptTerm } = dto;

        this.text = new MultilingualText(text);

        this.contributorId = contributorId;

        this.audioFilename = audioFilename;

        this.sourceProject = sourceProject;

        // we default to false for pre existing data
        this.isPromptTerm = isNullOrUndefined(isPromptTerm) ? false : isPromptTerm;
    }

    getName(): MultilingualText {
        return this.text.clone();
    }

    translate(text: string, languageCode: LanguageCode): ResultOrError<Term> {
        const textUpdateResult = this.text.translate(
            new MultilingualTextItem({
                role: MultilingualTextItemRole.freeTranslation,
                languageCode,
                text,
            })
        );

        if (isInternalError(textUpdateResult)) return textUpdateResult;

        return this.safeClone<Term>({
            text: textUpdateResult,
        });
    }

    elicitFromPrompt(text: string, languageCode: LanguageCode): ResultOrError<Term> {
        const textUpdateResult = this.text.translate(
            new MultilingualTextItem({
                role: MultilingualTextItemRole.elicitedFromPrompt,
                languageCode,
                text,
            })
        );

        if (isInternalError(textUpdateResult)) return textUpdateResult;

        return this.safeClone<Term>({
            text: textUpdateResult,
        });
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [TRANSLATE_TERM];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { text, published } = this;

        const textValidationResult = text.validateComplexInvariants();

        if (!isValid(textValidationResult)) allErrors.push(textValidationResult);

        // isn't this a simple invariant?
        if (typeof published !== 'boolean')
            allErrors.push(new InvalidPublicationStatusError(ResourceType.term));

        return allErrors;
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
    }

    // TODO We should 'goodlist' properties that can be targets for this context as well
    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }
}
