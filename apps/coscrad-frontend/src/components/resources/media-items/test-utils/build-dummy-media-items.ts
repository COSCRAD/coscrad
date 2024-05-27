import {
    IMediaItemViewModel,
    LanguageCode,
    MIMEType,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';

export const buildDummyMediaItems = (): IMediaItemViewModel[] => [
    {
        id: '77',
        title: 'good song (language title)',
        titleEnglish: 'good song (English title)',
        url: 'https:/www.freemusicforyou.org/goodie.mp3',
        lengthMilliseconds: 65677,
        mimeType: MIMEType.mp3,
        name: {
            items: [
                {
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                    text: 'good song (language title)',
                },
                {
                    role: MultilingualTextItemRole.freeTranslation,
                    languageCode: LanguageCode.English,
                    text: 'good song (English title)',
                },
            ],
        },
    },
    {
        id: '78',
        title: 'bad song (language title)',
        url: 'https:/www.freemusicforyou.org/garbage.mp3',
        lengthMilliseconds: 35444,
        mimeType: MIMEType.mp3,
        name: {
            items: [
                {
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                    text: 'bad song (language title)',
                },
            ],
        },
    },
    {
        id: '79',
        title: 'good video (language title)',
        titleEnglish: 'good video (English title)',
        url: 'https:/www.webflix.org/feature-length.mp4',
        lengthMilliseconds: 230000,
        mimeType: MIMEType.mp4,
        name: {
            items: [
                {
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                    text: 'good video (language title)',
                },
                {
                    role: MultilingualTextItemRole.freeTranslation,
                    languageCode: LanguageCode.English,
                    text: 'good video (English title)',
                },
            ],
        },
    },
];
