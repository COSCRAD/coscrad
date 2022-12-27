import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject, URL, UUID } from '@coscrad/data-types';
import { IsNonEmptyArray } from '@coscrad/validation';
import { Equals } from 'class-validator';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../types/AggregateType';
import { ICreateCommand } from '../../../shared/command-handlers/interfaces/create-command.interface';
import BibliographicReferenceCreator from '../../common/bibliographic-reference-creator.entity';

// convenient shorthand
const isOptional = true;

class JournalArticleBibliographicReferenceCompositeId {
    /**
     * This is a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     *
     * take Equals from @coscrad/validation
     *
     * share this class with other bibliographic reference models
     */
    @Equals(AggregateType.bibliographicReference)
    type = AggregateType.bibliographicReference;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_REFERENCE',
    label: 'Create Journal Article Bibliographic Reference',
    description: 'Creates a new journal article bibliographic reference',
})
export class CreateJournalArticleBibliographicReference implements ICreateCommand {
    @NestedDataType(JournalArticleBibliographicReferenceCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.bibliographicReference
    >;

    @RawDataObject({
        isOptional,
        label: 'raw data',
        description: 'raw data from third-party system of origin (e.g. Zotero)',
    })
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
    @NonEmptyString({
        label: 'title',
        description: 'title of the referenced journal article',
    })
    readonly title: string;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/183109468]
     * Support non-empty array based on `isOptional`.
     */
    @IsNonEmptyArray()
    @NestedDataType(BibliographicReferenceCreator, {
        isArray: true,
        label: 'creators',
        description: 'the authors of the referenced journal article',
    })
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({
        isOptional,
        label: 'abstract',
        description: 'a brief summary of the referenced journal article',
    })
    readonly abstract?: string;

    @NonEmptyString({
        label: 'issue date',
        description: 'a free-form text representation of the date of publication',
    })
    // WARNING: this is unstructured data from Zotero
    readonly issueDate: string;

    @NonEmptyString({
        isOptional,
        label: 'publication title',
        description: 'the name of the journal in which the article was published',
    })
    readonly publicationTitle?: string;

    @URL({
        isOptional,
        label: 'external link',
        description: 'an external web link to the referenced journal article',
    })
    readonly url?: string;

    @NonEmptyString({
        isOptional,
        label: 'pages',
        description:
            'text summary of the pages on which this article appears in the larger journal',
    })
    // TODO Clarify the significance of this property
    readonly pages?: string;

    @NonEmptyString({ isOptional, label: 'ISSN', description: 'the ISSN of the journal article' })
    readonly issn?: string;

    @NonEmptyString({ isOptional, label: 'DOI', description: 'the DOI of the journal article' })
    readonly doi?: string;
}
