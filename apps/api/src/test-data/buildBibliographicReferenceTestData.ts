import { BookBibliographicReference } from '../domain/models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import {
    CreatorType,
    ZoteroCreator,
} from '../domain/models/bibliographic-reference/types/ZoteroCreator';
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
                    firstName: 'Alana',
                    lastName: 'Smith',
                    type: CreatorType.author,
                },
            ] as ZoteroCreator[],
            abstract: 'This is the abstract, NOT a general note!',
            year: 1999,
            publisher: 'Atlantic Publishing',
            place: 'Kennebunk Port, Maine',
            url: 'http://atlanticpublishing.com',
            numberOfPages: 455,
            isbn: '978-1-895811-34-6',
        },
        published: true,
        id: '1',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new BookBibliographicReference(dto));
