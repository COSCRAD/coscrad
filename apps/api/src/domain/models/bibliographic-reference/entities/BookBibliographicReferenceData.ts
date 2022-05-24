import {
    ArrayNotEmpty,
    IsInt,
    IsISBN,
    IsOptional,
    IsPositive,
    IsStringWithNonzeroLength,
    IsUrl,
    IsYear,
} from '@coscrad/validation';
import { DTO } from '../../../../types/DTO';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { IBibliographicReferenceData } from '../interfaces/IBibliographicReferenceData';
import { BibliographicReferenceType } from '../types/BibliographicReferenceType';
import Creator from '../types/Creator';

export default class BookBibliographicReferenceData
    extends BaseDomainModel
    implements IBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.book;

    @IsStringWithNonzeroLength()
    readonly title: string;

    @ArrayNotEmpty()
    readonly creators: Creator[];

    @IsOptional()
    @IsStringWithNonzeroLength()
    // `abstractNote` is what Zotero calls this property
    readonly abstract?: string;

    @IsOptional()
    @IsYear()
    readonly year?: number;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly publisher?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly place?: string;

    @IsOptional()
    @IsUrl()
    readonly url?: string;

    @IsOptional()
    @IsInt()
    @IsPositive()
    readonly numberOfPages?: number;

    @IsOptional()
    @IsISBN()
    readonly isbn?: string;

    constructor(dto: DTO<BookBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.title = dto.title;

        this.creators = dto.creators as Creator[];

        this.abstract = dto.abstract;

        this.year = dto.year;

        this.publisher = dto.publisher;

        this.place = dto.place;

        this.url = dto.url;

        this.isbn = dto.isbn;

        this.numberOfPages = dto.numberOfPages;
    }
}
