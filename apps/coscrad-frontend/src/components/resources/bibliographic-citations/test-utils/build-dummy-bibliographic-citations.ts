import {
    BibliographicCitationType,
    IBibliographicCitationViewModel,
    IBookBibliographicCitationData,
    ICourtCaseBibliographicCitationData,
    IJournalArticleBibliographicCitationData,
} from '@coscrad/api-interfaces';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { buildMultilingualTextFromEnglishOriginal } from '../../../notes/test-utils';

// TODO Use BibliographicSubjectCreator enum here
const AUTHOR = BibliographicSubjectCreatorType.author;

const dummyBook: IBibliographicCitationViewModel<IBookBibliographicCitationData> = {
    name: buildMultilingualTextFromEnglishOriginal('A Day in the Life'),
    data: {
        type: BibliographicCitationType.book,
        title: 'A Day in the Life',
        creators: [
            {
                name: 'Alana Duvernay',
                type: AUTHOR,
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
    id: '1',
    contributions: ['Rusty Smith'],
};

const dummyJournalArticle: IBibliographicCitationViewModel<IJournalArticleBibliographicCitationData> =
    {
        name: buildMultilingualTextFromEnglishOriginal(
            'Report on the Cariboo Chilcotin Justice inquiry'
        ),
        data: {
            type: BibliographicCitationType.journalArticle,
            title: 'Report on the Cariboo Chilcotin Justice inquiry',
            creators: [
                {
                    name: 'Sigurd Purcell',
                    type: AUTHOR,
                },
            ],
            abstract: 'An analysis of the Cariboo Chilcotin Justice inquiry.',
            issueDate: 'Spring 2013',
            publicationTitle: 'Journal of History',
            url: 'https://search.proquest.com/docview/1682229477/abstract/7836BCEA06014582PQ/1',
            issn: '00052949',
            doi: '10.14288/bcs.v0i19.784',
        },
        id: '23',
        contributions: ['Ron Doe'], // John's brother.
    };

const dummyCourtCase: IBibliographicCitationViewModel<ICourtCaseBibliographicCitationData> = {
    name: buildMultilingualTextFromEnglishOriginal("2002-07-08_Tsilhqot'inTitleCase"),
    data: {
        type: BibliographicCitationType.courtCase,
        caseName: "2002-07-08_Tsilhqot'inTitleCase",
        abstract:
            "William, June\n- Nemiah Valley\n- Qualifying as an expert in Tsilhqot'in written language",
        dateDecided: 'Recorded 2002-07-08',
        court: 'Supreme Court of British Columbia',
        url: 'https://www.myzoterolink.com/bogus-link-to-doc.php',
        pages: 'Pages 1-6',
    },
    id: '3',
    contributions: ['Jane Deer'],
};

export const buildDummyBibliographicCitations = (): IBibliographicCitationViewModel[] => [
    dummyBook,
    dummyJournalArticle,
    dummyCourtCase,
];
