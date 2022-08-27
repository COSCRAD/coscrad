import { NestedDataType, NonEmptyString, URL } from '@coscrad/data-types';
import { IsNonEmptyArray, IsStringWithNonzeroLength } from '@coscrad/validation';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import BibliographicReferenceCreator from '../common/bibliographic-reference-creator.entity';
import { IBibliographicReferenceData } from '../interfaces/bibliographic-reference-data.interface';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';

const isOptional = true;

export default class JournalArticleBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.journalArticle;

    @IsStringWithNonzeroLength()
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

    /**
     * Note that in some instances, this data is not present in Zotero. In some
     * cases, Zotero represents the missing `issueDate` as an empty string.
     * Within our system, we will ommit the property instead of allowing empty strings.
     * So the property is optional, but if provided, it must be a non-empty string.
     */
    @NonEmptyString({ isOptional })
    // WARNING: this is unstructured data from Zotero
    readonly issueDate?: string;

    @NonEmptyString({ isOptional })
    readonly publicationTitle?: string;

    @URL({ isOptional })
    readonly url?: string;

    @NonEmptyString({ isOptional })
    readonly pages?: string;

    @NonEmptyString({ isOptional })
    readonly issn?: string;

    @NonEmptyString({ isOptional })
    readonly doi?: string;

    constructor(dto: DTO<JournalArticleBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        const { title, creators, abstract, issueDate, publicationTitle, url, pages, issn, doi } =
            dto;

        this.title = title;

        this.creators = creators.map((creatorDto) => new BibliographicReferenceCreator(creatorDto));

        this.abstract = abstract;

        this.issueDate = issueDate;

        this.publicationTitle = publicationTitle;

        this.url = url;

        this.pages = pages;

        this.issn = issn;

        this.doi = doi;
    }
}
