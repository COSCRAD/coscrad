import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { DTO } from 'apps/api/src/types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { EntityId } from '../../../types/ResourceId';
import { ResourceType, resourceTypes } from '../../../types/resourceTypes';
import { TextFieldContext } from '../../context/text-field-context/text-field-context.entity';
import { Resource } from '../../resource.entity';
import validateTextFieldContextForModel from '../../shared/contextValidators/validateTextFieldContextForModel';

export class Term extends Resource {
    readonly type: ResourceType = resourceTypes.term;

    readonly term?: string;

    readonly termEnglish?: string;

    readonly contributorId: EntityId;

    // TODO Create separate media item model
    readonly audioFilename?: string;

    // We may want to use tags for this
    readonly sourceProject?: string;

    // The constructor should only be called after validating the input DTO
    constructor(dto: DTO<Term>) {
        super({ ...dto, type: resourceTypes.term });

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

        if (dto.sourceProject) this.sourceProject = dto.sourceProject;
    }

    // TODO We should 'goodlist' properties that can be targets for this context as well
    validateTextFieldContext(context: TextFieldContext): Valid | InternalError {
        return validateTextFieldContextForModel(this, context);
    }
}
