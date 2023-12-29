import { IJournalArticleBibliographicCitationData } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString, URL } from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import { BibliographicCitationDataUnionMember } from '../../shared/bibliographic-citation-union-data-member.decorator';
import { BibliographicCitationType } from '../../types/bibliographic-citation-type';

const isOptional = true;

@BibliographicCitationDataUnionMember(BibliographicCitationType.journalArticle)
export default class JournalArticleBibliographicCitationData
    extends BaseDomainModel
    implements IJournalArticleBibliographicCitationData
{
    readonly type = BibliographicCitationType.journalArticle;

    @NonEmptyString({
        label: 'title',
        description: 'the title of the referenced journal article',
    })
    readonly title: string;

    @NestedDataType(BibliographicCitationCreator, {
        isArray: true,
        // i.e. must be non-empty
        isOptional: false,
        label: 'creators',
        description: 'the authors of the referenced journal article',
    })
    readonly creators: BibliographicCitationCreator[];

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

    // TODO Support ISSN data type \ validation
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

    constructor(dto: DTO<JournalArticleBibliographicCitationData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        const { title, creators, abstract, issueDate, publicationTitle, url, issn, doi } = dto;

        this.title = title;

        this.creators = creators.map((creatorDto) => new BibliographicCitationCreator(creatorDto));

        this.abstract = abstract;

        this.issueDate = issueDate;

        this.publicationTitle = publicationTitle;

        this.url = url;

        this.issn = issn;

        this.doi = doi;
    }
}
