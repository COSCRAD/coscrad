import {
    FormFieldType,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

const validValues: string[] = ['1', '2'];

const dummyTerms: ITermViewModel[] = [
    {
        id: '1',
        name: {
            items: [
                {
                    text: 'term 1 (language)',
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                },
            ],
        },
        audioURL: 'https://www.mysoundbox.com/foo.mp3',
        contributor: 'John Doe',
    },
    {
        id: '2',
        name: {
            items: [
                {
                    text: 'term 2 (language)- has no audio',
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                },
                {
                    text: 'term 2 (English)',
                    role: MultilingualTextItemRole.freeTranslation,
                    languageCode: LanguageCode.English,
                },
            ],
        },
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
        name: {
            items: [
                {
                    text: 'VL name (language)',
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                },
            ],
        },
        entries: dummyEntries,
        form: {
            fields: [
                {
                    name: 'possessor',
                    label: 'Possessor',
                    description: 'Owner of the noun that is subject of the paradigm',
                    type: FormFieldType.staticSelect,
                    options: validValues.map((value) => ({
                        value,
                        display: value,
                    })),
                    constraints: [],
                },
            ],
        },
    },
];

export const buildDummyVocabularyLists = () => dummyVocabularyLists;
