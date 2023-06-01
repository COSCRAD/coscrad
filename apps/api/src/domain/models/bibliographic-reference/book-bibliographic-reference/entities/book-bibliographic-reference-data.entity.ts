import { IBookBibliographicReferenceData } from '@coscrad/api-interfaces';
import {
    ISBN,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    Union2Member,
    URL,
    Year,
} from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { DTO } from '../../../../../types/DTO';
import { BIBLIOGRAPHIC_REFERENCE_DATA_UNION } from '../../../../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import { EMPTY_DTO_INJECTION_TOKEN } from '../../../context/free-multiline-context/free-multiline-context.entity';
import BibliographicReferenceCreator from '../../common/bibliographic-reference-creator.entity';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';

const isOptional = true;

@Union2Member(BIBLIOGRAPHIC_REFERENCE_DATA_UNION, BibliographicReferenceType.book)
export default class BookBibliographicReferenceData
    extends BaseDomainModel
    implements IBookBibliographicReferenceData
{
    readonly type = BibliographicReferenceType.book;

    @NonEmptyString({
        label: 'title',
        description: 'the title of the referenced book',
    })
    readonly title: string;

    @NestedDataType(BibliographicReferenceCreator, {
        isOptional: false,
        isArray: true,
        label: 'creators',
        description: 'those responsible for creating this work',
    })
    readonly creators: BibliographicReferenceCreator[];

    @NonEmptyString({
        isOptional,
        label: 'abstract',
        description: 'a brief summary of the referenced book',
    })
    // `abstractNote` is what Zotero calls this property
    readonly abstract?: string;

    @Year({
        isOptional,
        label: 'year',
        description: 'A number representing the year of publication',
    })
    readonly year?: number;

    @NonEmptyString({
        isOptional,
        label: 'publisher',
        description: 'the publisher of the referenced book',
    })
    readonly publisher?: string;

    @NonEmptyString({
        isOptional,
        label: 'place',
        description: 'the place where the referenced book was published',
    })
    readonly place?: string;

    @URL({
        isOptional,
        label: 'external link',
        description: 'an link to an external digital representation of the book',
    })
    readonly url?: string;

    @PositiveInteger({
        isOptional,
        label: 'number of pages',
        description: 'the total number of pages in the referenced book',
    })
    readonly numberOfPages?: number;

    @ISBN({
        isOptional,
        label: 'ISBN',
        description: 'a standardized globally unique identifier for the referenced book',
    })
    readonly isbn?: string;

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<BookBibliographicReferenceData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.title = dto.title;

        this.creators = dto.creators as BibliographicReferenceCreator[];

        this.abstract = dto.abstract;

        this.year = dto.year;

        this.publisher = dto.publisher;

        this.place = dto.place;

        this.url = dto.url;

        this.isbn = dto.isbn;

        this.numberOfPages = dto.numberOfPages;
    }
}
