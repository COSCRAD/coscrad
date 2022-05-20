import { BookBibliographicReference } from '../domain/models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { CreatorType } from '../domain/models/bibliographic-reference/types/CreatorType';
import { resourceTypes } from '../domain/types/resourceTypes';
import { DTO } from '../types/DTO';

// TODO Break out separate test data builder for each sub-type
const dtos: DTO<BookBibliographicReference>[] = [
    {
        type: resourceTypes.bibliographicReference,
        data: {
            type: BibliographicReferenceType.book,
            title: 'A Day in the Life',
            creators: [
                {
                    name: 'Alana Duvernay',
                    type: CreatorType.author,
                },
            ],
            abstract: 'This is the abstract, NOT a general note!',
            year: 1999,
            publisher: 'Atlantic Publishing',
            place: 'Kennebunk Port, Maine',
            url: 'https://atlanticpublishing.com',
            numberOfPages: 455,
            isbn: '978-1-895811-34-6',
        },
        published: true,
        id: '1',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new BookBibliographicReference(dto));
