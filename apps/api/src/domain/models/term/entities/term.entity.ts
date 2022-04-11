import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { ResourceId } from '../../../types/ResourceId';
import { ResourceType, resourceTypes } from '../../../types/resourceTypes';
import { Resource } from '../../resource.entity';

export class Term extends Resource {
    readonly type: ResourceType = resourceTypes.term;

    readonly term: string;

    readonly termEnglish?: string;

    readonly contributorId: ResourceId;

    // TODO Create separate media item model
    readonly audioFilename?: string;

    // We may want to use tags for this
    readonly sourceProject: string;

    // The constructor should only be called after validating the input DTO
    constructor(dto: PartialDTO<Term>) {
        super(dto);

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
}
