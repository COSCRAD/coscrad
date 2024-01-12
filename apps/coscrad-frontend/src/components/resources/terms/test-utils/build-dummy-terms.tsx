import { ITermViewModel, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';

export const buildDummyTerms = (): ITermViewModel[] => [
    {
        id: '1',
        name: {
            items: [{
                text: 'term 1 in language',
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.original
            },
            {
                text: 'term 1 translated to English',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.freeTranslation
            }
        ]
        },
        contributor: 'Bob Sith',
    },
    {
        id: '2',
        name: {
            items: [{
                text: 'term 2 in language (no translation)',
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.original
            }
        ]
        },
        contributor: 'Barb James',
    },
    {
        id: '3',
        name: {
            items: [{
                text: 'term 3 English (no language entry)',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original
            }
        ]
        },
        contributor: 'Ronald McDonnald',
    },
];
