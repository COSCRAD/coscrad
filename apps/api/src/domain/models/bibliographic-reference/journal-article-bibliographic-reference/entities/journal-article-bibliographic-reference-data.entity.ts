import { IJournalArticleBibliographicReferenceData } from '@coscrad/api-interfaces';
import { DiscriminatedBy, NestedDataType, NonEmptyString, URL } from '@coscrad/data-types';
import { IsNonEmptyArray } from '@coscrad/validation';
import { DTO } from '../../../../../types/DTO';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import BibliographicReferenceCreator from '../../common/bibliographic-reference-creator.entity';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';

const isOptional = true;

@DiscriminatedBy(BibliographicReferenceType.journalArticle)
export default class JournalArticleBibliographicReferenceData
    extends BaseDomainModel
    implements IJournalArticleBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.journalArticle;

    @NonEmptyString({
        label: 'title',
        description: 'the title of the referenced journal article',
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
        description: 'a brief summary of the journal article',
    })
    readonly abstract?: string;

    @NonEmptyString({
        label: 'issue date',
        description: 'unstructured text representation of the date the journal article was issued',
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
        description:
            'an external link to a digital representation of the referenced journal article',
    })
    readonly url?: string;

    @NonEmptyString({
        isOptional,
        label: 'ISSN',
        description: 'a standardized unique identifier for the journal article',
    })
    readonly issn?: string;

    @NonEmptyString({
        isOptional,
        label: 'DOI',
        description: 'an alternative unique identifier in the form of a permalink',
    })
    readonly doi?: string;

    constructor(dto: DTO<JournalArticleBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        const { title, creators, abstract, issueDate, publicationTitle, url, issn, doi } = dto;

        this.title = title;

        this.creators = creators.map((creatorDto) => new BibliographicReferenceCreator(creatorDto));

        this.abstract = abstract;

        this.issueDate = issueDate;

        this.publicationTitle = publicationTitle;

        this.url = url;

        this.issn = issn;

        this.doi = doi;
    }
}
