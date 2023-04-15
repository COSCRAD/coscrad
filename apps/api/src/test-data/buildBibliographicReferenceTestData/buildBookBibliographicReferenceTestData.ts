import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { BookBibliographicReference } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<BookBibliographicReference>[] = [
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.book,
            title: 'A Day in the Life',
            creators: [
                {
                    name: 'Alana Duvernay',
                    type: BibliographicSubjectCreatorType.author,
                },
                {
                    name: 'James Smith',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract: 'This is the abstract, NOT a general note!',
            year: 1999,
            publisher: 'Atlantic Publishing',
            place: 'Kennebunk Port, Maine',
            url: 'https://atlanticpublishing.com/authors/Duvernay/NewBook/BookInformation/',
            numberOfPages: 455,
            isbn: '978-1-895811-34-6',
        },
        published: true,
        id: '1',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new BookBibliographicReference(dto));
