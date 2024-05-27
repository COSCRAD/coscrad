import { ITermViewModel, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';

export const buildDummyTerms = (): ITermViewModel[] => [
    {
        id: '1',
        name: {
            items: [
                {
                    text: 'term 1 in language',
                    languageCode: LanguageCode.Chilcotin,
                    role: MultilingualTextItemRole.original,
                },
                {
                    text: 'term 1 translated to English',
                    languageCode: LanguageCode.English,
                    role: MultilingualTextItemRole.freeTranslation,
                },
            ],
        },
        contributions: ['Bob Sith'],
    },
    {
        id: '2',
        name: {
            items: [
                {
                    text: 'term 2 in language (no translation)',
                    languageCode: LanguageCode.Chilcotin,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        contributions: ['Barb James'],
    },
    {
        id: '3',
        name: {
            items: [
                {
                    text: 'term 3 English (no language entry)',
                    languageCode: LanguageCode.English,
                    role: MultilingualTextItemRole.original,
                },
            ],
        },
        contributions: ['Ronald McDonnald'],
    },
];
