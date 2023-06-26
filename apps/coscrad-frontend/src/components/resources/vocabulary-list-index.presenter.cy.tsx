import {
    FormFieldType,
    IIndexQueryResult,
    ITermViewModel,
    IVocabularyListEntry,
    IVocabularyListViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

describe('<VocabularyListIndexPresenter />', () => {
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
            audioURL: 'https://coscrad.org/wp-content/uploads/2023/06/511.mp3',
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
        {
            id: '3',
            name: {
                items: [
                    {
                        text: 'term 3 (language)- has no audio',
                        role: MultilingualTextItemRole.original,
                        languageCode: LanguageCode.Chilcotin,
                    },
                    {
                        text: 'term 3 (English)',
                        role: MultilingualTextItemRole.literalTranslation,
                        languageCode: LanguageCode.English,
                    },
                ],
            },
            contributor: 'John Doe Jr',
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

    const dummyIndexQueryResponse: IIndexQueryResult<IVocabularyListViewModel> = {
        // we're not testing commands so we don't need any actions in the stubbed response
        indexScopedActions: [],
        entities: dummyVocabularyLists.map((list) => ({
            ...list,
            actions: [],
        })),
    };

    describe(`when there is a Vocabulary List`, () => {
        beforeEach(() => {
            cy.intercept(
                {
                    method: 'GET', // Route all GET requests
                    url: '/api/vocabulary-lists/', // that have a URL that matches '/users/*'
                },
                dummyIndexQueryResponse
            );
        });
    });
});
