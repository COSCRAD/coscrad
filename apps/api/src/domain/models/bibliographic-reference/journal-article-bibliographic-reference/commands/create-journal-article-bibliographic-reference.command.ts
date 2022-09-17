import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { IsNonEmptyArray } from '@coscrad/validation';
import { AggregateId } from '../../../../types/AggregateId';
import { ICreateCommand } from '../../../shared/command-handlers/interfaces/create-command.interface';
import BibliographicReferenceCreator from '../../common/bibliographic-reference-creator.entity';

// convenient shorthand
const isOptional = true;

@Command({
    type: 'CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_REFERENCE',
    label: 'Create Journal Article Bibliographic Reference',
    description: 'Creates a new journal article bibliographic reference',
})
export class CreateJournalArticleBibliographicReference implements ICreateCommand {
    @UUID()
    readonly id: AggregateId;

    @RawDataObject({ isOptional })
    // Perhaps this should be part of ICreateCommand?
    readonly rawData?: Record<string, unknown>;

    /**
     * The following props are essentially a `JournalArticleBibliographicReferenceData`
     * DTO. We define them independently, however, to avoid coupling the domain
     * model to the command payload. Amongst other concerns, this forces us to be
     * explicit about changes.
     *
     * This is why we ignore command.ts files in Sonar Cloud.
     */
    @NonEmptyString()
    readonly title: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183109468]
     * Support non-empty array based on `isOptional`.
     */
    @IsNonEmptyArray()
    @NestedDataType(BibliographicReferenceCreator, { isArray: true })
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({ isOptional })
    readonly abstract?: string;

    @NonEmptyString()
    // WARNING: this is unstructured data from Zotero
    readonly issueDate: string;

    @NonEmptyString({ isOptional })
    readonly publicationTitle?: string;

    @URL({ isOptional })
    readonly url?: string;

    @NonEmptyString({ isOptional })
    // TODO Clarify the significance of this property
    readonly pages?: string;

    @NonEmptyString({ isOptional })
    readonly issn?: string;

    @NonEmptyString({ isOptional })
    readonly doi?: string;
}
