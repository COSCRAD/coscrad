import {
    DropboxOrCheckbox,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';

const validValues: string[] = ['1', '2'];

const dummyTerms: ITermViewModel[] = [
    {
        id: '1',
        term: 'term 1 (language)',
        audioUrl: 'https://www.mysoundbox.com/foo.mp3',
        contributor: 'John Doe',
    },
    {
        id: '2',
        term: 'term 2 (language)- has no audio',
        termEnglish: 'term 2 (English)',
        contributor: 'Jane Deer',
    },
];

const dummyEntries: IVocabularyListEntry<boolean | string>[] = dummyTerms.map(
    (term, index): IVocabularyListEntry<boolean | string> => ({
        term,
        variableValues: {
            person: validValues[index],
        },
    })
);

const dummyVocabularyLists: IVocabularyListViewModel[] = [
    {
        id: '345',
        name: 'VL name (language)',
        nameEnglish: 'VL name (English)',
        entries: dummyEntries,
        variables: [
            {
                name: 'possessor',
                type: DropboxOrCheckbox.dropbox,
                validValues: validValues.map((value) => ({
                    value,
                    display: value,
                })),
            },
        ],
    },
];

export const buildDummyVocabularyLists = () => dummyVocabularyLists;