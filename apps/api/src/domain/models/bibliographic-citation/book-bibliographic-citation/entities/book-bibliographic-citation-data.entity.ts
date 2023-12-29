import { IBookBibliographicCitationData } from '@coscrad/api-interfaces';
import {
    ISBN,
    NestedDataType,
    NonEmptyString,
    PositiveInteger,
    URL,
    Year,
} from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../../BaseDomainModel';
import BibliographicCitationCreator from '../../common/bibliographic-citation-creator.entity';
import { BibliographicCitationDataUnionMember } from '../../shared/bibliographic-citation-union-data-member.decorator';
import { BibliographicCitationType } from '../../types/bibliographic-citation-type';

const isOptional = true;

@BibliographicCitationDataUnionMember(BibliographicCitationType.book)
export default class BookBibliographicCitationData
    extends BaseDomainModel
    implements IBookBibliographicCitationData
{
    readonly type = BibliographicCitationType.book;

    @NonEmptyString({
        label: 'title',
        description: 'the title of the referenced book',
    })
    readonly title: string;

    @NestedDataType(BibliographicCitationCreator, {
        isOptional: false,
        isArray: true,
        label: 'creators',
        description: 'those responsible for creating this work',
    })
    readonly creators: BibliographicCitationCreator[];

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

    constructor(dto: DTO<BookBibliographicCitationData>) {
        super();

        if (isNullOrUndefined(dto)) return;

        this.title = dto.title;

        this.creators = dto.creators as BibliographicCitationCreator[];

        this.abstract = dto.abstract;

        this.year = dto.year;

        this.publisher = dto.publisher;

        this.place = dto.place;

        this.url = dto.url;

        this.isbn = dto.isbn;

        this.numberOfPages = dto.numberOfPages;
    }
}
