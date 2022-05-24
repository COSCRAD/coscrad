import {
    ArrayNotEmpty,
    IsOptional,
    IsStringWithNonzeroLength,
    IsUrl,
} from '../../../../../../../libs/validation/src';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { IBibliographicReferenceData } from '../interfaces/IBibliographicReferenceData';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';
import BibliographicReferenceCreator from './BibliographicReferenceCreator';

export default class JournalArticleBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.journalArticle;

    @IsStringWithNonzeroLength()
    readonly title: string;

    @ArrayNotEmpty()
    readonly creators: BibliographicReferenceCreator[];

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly abstract?: string;

    @IsStringWithNonzeroLength()
    // WARNING: this is unstructured data from Zotero
    readonly issueDate: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly publicationTitle?: string;

    @IsOptional()
    @IsUrl()
    readonly url?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly pages?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly issn?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
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
