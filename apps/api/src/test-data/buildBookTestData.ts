import { Book } from '../domain/models/book/entities/book.entity';
import { PartialDTO } from '../types/partial-dto';

const dtos: PartialDTO<Book>[] = [
    {
        id: '23',
        title: 'Three Little Pigs',
        subtitle: "The wolf's revenge",
        author: 'John Doeburg',
        publicationDate: '2002',
        pages: [
            {
                identifier: '1',
                text: 'foo',
                translation: 'dee foo',
            },
            {
                identifier: '2',
                text: 'blah blah blah',
                translation: 'blahas',
            },
        ],
        published: true,
    },
    {
        id: '24',
        title: 'An Adventure Story',
        author: 'Jane Donnaldson',
        publicationDate: '2011',
        pages: [
            {
                identifier: 'ix',
                text: 'blah blah blah',
                translation: 'blahas',
            },
        ],
        // The publication status should not be true if there are no pages
        published: false,
    },
];

export default (): Book[] => dtos.map((dto) => new Book(dto));
