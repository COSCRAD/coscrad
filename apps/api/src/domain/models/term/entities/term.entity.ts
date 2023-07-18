import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import { Valid, isValid } from '../../../domainModelValidators/Valid';
import InvalidPublicationStatusError from '../../../domainModelValidators/errors/InvalidPublicationStatusError';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';
import { CREATE_TERM } from '../commands/create-term/constants';

const isOptional = true;

@RegisterIndexScopedCommands([CREATE_TERM])
export class Term extends Resource {
    readonly type: ResourceType = ResourceType.term;

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

    @NonEmptyString({
        label: 'contributor ID',
        description: 'reference to the contributor for this term',
    })
    readonly contributorId: AggregateId;

    /**
     * TODO Make this a mediaItemId
     */
    @NonEmptyString({
        isOptional,
        label: 'Audio Filename',
        description: 'a url link to the audio file',
    })
    readonly audioFilename?: string;

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

        const { contributorId, audioFilename, sourceProject, text } = dto;

        this.text = new MultilingualText(text);

        this.contributorId = contributorId;

        this.audioFilename = audioFilename;

        this.sourceProject = sourceProject;
    }

    getName(): MultilingualText {
        return this.text.clone();
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
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
