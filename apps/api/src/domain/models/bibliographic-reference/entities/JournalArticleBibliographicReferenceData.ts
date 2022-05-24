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
import Creator from '../types/Creator';

export default class JournalArticleBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.journalArticle;

    @IsStringWithNonzeroLength()
    readonly title: string;

    @ArrayNotEmpty()
    readonly creators: Creator[];

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly abstract?: string;

    @IsStringWithNonzeroLength()
    readonly date: string;

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

        this.title = dto.title;

        this.creators = dto.creators as Creator[];

        this.abstract = dto.abstract;

        this.date = dto.date;

        this.publicationTitle = dto.publicationTitle;

        this.url = dto.url;

        this.pages = dto.pages;

        this.issn = dto.issn;

        this.doi = dto.doi;
    }
}
