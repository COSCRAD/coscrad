import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { RegisterDigitalRepresentationOfBibliographicCitation } from '../../domain/models/bibliographic-citation/common/commands/register-digital-representation-of-bibiliographic-citation';
import { AggregateType } from '../../domain/types/AggregateType';
import { ResourceType } from '../../domain/types/ResourceType';

const bookId = buildDummyUuid(81);

const type = AggregateType.bibliographicCitation;

const createBookBibliographicCitation = {
    type: `CREATE_BOOK_BIBLIOGRAPHIC_CITATION`,
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

// TODO Add other create commands

const registerDigitalRepresentationOfBibliographicCitation: CommandFSA<RegisterDigitalRepresentationOfBibliographicCitation> =
    {
        type: `REGISTER_DIGITAL_REPRESENTATION_OF_BIBLIOGRAPHIC_CITATION`,
        payload: {
            aggregateCompositeIdentifier: {
                type,
                id: bookId,
            },
            digitalRepresentationResourceCompositeIdentifier: {
                type: ResourceType.digitalText,
                id: buildDummyUuid(135),
            },
        },
    };

export const buildBibliographicCitationTestCommandFsas = () => [
    createBookBibliographicCitation,
    registerDigitalRepresentationOfBibliographicCitation,
];
