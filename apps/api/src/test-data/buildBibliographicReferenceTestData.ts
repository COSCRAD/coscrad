import { BookBibliographicReference } from '../domain/models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { IBibliographicReference } from '../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { resourceTypes } from '../domain/types/resourceTypes';
import { DTO } from '../types/DTO';

// TODO Break out separate test data builder for each sub-type
const dtos: DTO<BookBibliographicReference>[] = [
    {
        type: resourceTypes.bibliographicReference,
        data: {
            type: BibliographicReferenceType.book,
            title: 'A Day in the Life',
        },
        published: true,
        id: '1',
    },
];

export default (): IBibliographicReference[] =>
    dtos.map((dto) => new BookBibliographicReference(dto));
