import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateType } from '../../domain/types/AggregateType';

const bookId = buildDummyUuid(81);

const type = AggregateType.bibliographicReference;

const createBookBibliographicReference = {
    type: `CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE`,
    payload: {
        aggregateCompositeIdentifier: {
            type,
            id: bookId,
        },
        title: 'old dusty book',
        creators: [
            {
                type: BibliographicSubjectCreatorType.author,
                name: 'Scandalous McGee',
            },
        ],
        abstract: 'one filthy book',
        year: 1945,
        publisher: 'Printing Press Automated Publishers',
        place: 'Nowheresville, Canada',
        url: 'https://www.goodreadsarchive.com/foo.pdf',
        numberOfPages: 102,
        isbn: `978-3-16-148410-0`,
    },
};

export const buildBibliographicReferenceTestCommandFsas = () => [createBookBibliographicReference];
