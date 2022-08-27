import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { BookBibliographicReference } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/book-bibliographic-reference.entity';
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
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.book,
            title: 'The Shuswap. Memoirs of the AMNH ; v. 4, pt. 7; Publications of the Jesup North Pacific Expedition ; v. 2, pt. 7.',
            creators: [
                {
                    name: 'James Alexander Teit',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            abstract: 'x, p. [443]-813. illus. pl. 13-14 35 cm.',
            year: 1909,
            url: 'https://digitallibrary.amnh.org/handle/2246/38',
        },
        published: true,
        id: '2',
    },
    {
        type: ResourceType.bibliographicReference,
        data: {
            type: BibliographicReferenceType.book,
            title: 'The archive of place: unearthing the pasts of the Chilcotin Plateau',
            creators: [
                {
                    name: 'William J. Turkel',
                    type: BibliographicSubjectCreatorType.author,
                },
            ],
            year: 2007,
            publisher: 'UBC Press',
            place: 'Vancouver',
            url: 'https://vpl.bibliocommons.com/v2/record/S38C1549002',
            numberOfPages: 322,
            isbn: '978-0-7748-1376-1',
        },
        published: true,
        id: '3',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new BookBibliographicReference(dto));
