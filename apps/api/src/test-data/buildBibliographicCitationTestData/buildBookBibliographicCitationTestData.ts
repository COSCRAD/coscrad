import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { BookBibliographicCitation } from '../../domain/models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation.entity';
import { IBibliographicCitation } from '../../domain/models/bibliographic-citation/interfaces/bibliographic-citation.interface';
import { BibliographicCitationType } from '../../domain/models/bibliographic-citation/types/bibliographic-citation-type';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';
import { DTO } from '../../types/DTO';

const dtos: DTO<BookBibliographicCitation>[] = [
    {
        type: ResourceType.bibliographicCitation,
        data: {
            type: BibliographicCitationType.book,
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
            url: 'https://coscrad.org/wp-content/uploads/2023/05/mock-book-bibliographic-citation-1_a-day-in-the-life.pdf',
            numberOfPages: 455,
            isbn: '978-1-895811-34-6',
        },
        published: true,
        id: '1',
        digitalRepresentationResourceCompositeIdentifier: {
            type: AggregateType.digitalText,
            id: buildDummyUuid(1),
        },
    },
];

export default (): IBibliographicCitation[] =>
    dtos.map((dto) => new BookBibliographicCitation(dto));
