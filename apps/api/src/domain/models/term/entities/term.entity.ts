import { NonEmptyString } from '@coscrad/data-types';
import { isStringWithNonzeroLength } from '@coscrad/validation';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import InvalidPublicationStatusError from '../../../domainModelValidators/errors/InvalidPublicationStatusError';
import TermHasNoTextInAnyLanguageError from '../../../domainModelValidators/errors/term/TermHasNoTextInAnyLanguageError';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';

const isOptional = true;

@RegisterIndexScopedCommands([])
export class Term extends Resource {
    readonly type: ResourceType = ResourceType.term;

    @NonEmptyString({ isOptional })
    readonly term?: string;

    @NonEmptyString({ isOptional })
    readonly termEnglish?: string;

    @NonEmptyString()
    readonly contributorId: AggregateId;

    @NonEmptyString({ isOptional })
    readonly audioFilename?: string;

    @NonEmptyString({ isOptional })
    readonly sourceProject?: string;

    // The constructor should only be called after validating the input DTO
    constructor(dto: DTO<Term>) {
        super({ ...dto, type: ResourceType.term });

        // This should only happen in the validation context
        if (isNullOrUndefined(dto)) return;

        /**
         * TODO [design]: We should abstract this pattern of having text in multiple
         * languages. Options:
         * 1. interface `hasBilingualText`
         * ```js
         * {
         * text: string;
         * textInTranslationLanguage: string;
         * }
         * ```
         * 2. Have a separate layer that fetches translations. This approach would
         * allow us to express the direction of the relationship. Did we start with
         * an English gloss and ilicit the form in the indigenous language? Did we
         * start with the indignous term and elicit a translation or gloss?
         *
         * Related models that will use this concept:
         * Any entity that has (the potential for) a bilingual name
         * Texts, including transcripts for audio \ video
         */
        this.term = dto.term;

        this.termEnglish = dto.termEnglish;

        this.contributorId = dto.contributorId;

        this.audioFilename = dto.audioFilename;

        this.sourceProject = dto.sourceProject;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }

    protected validateComplexInvariants(): InternalError[] {
        const allErrors: InternalError[] = [];

        const { term, termEnglish, id, published } = this;

        if (!isStringWithNonzeroLength(term) && !isStringWithNonzeroLength(termEnglish))
            allErrors.push(new TermHasNoTextInAnyLanguageError(id));

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
