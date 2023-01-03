import { IMediaItemViewModel, MIMEType } from '@coscrad/api-interfaces';

export const buildDummyMediaItems = (): IMediaItemViewModel[] => [
    {
        id: '77',
        title: 'good song (language title)',
        titleEnglish: 'good song (English title)',
        url: 'https:/www.freemusicforyou.org/goodie.mp3',
        lengthMilliseconds: 65677,
        mimeType: MIMEType.mp3,
    },
    {
        id: '78',
        title: 'bad song (language title)',
        url: 'https:/www.freemusicforyou.org/garbage.mp3',
        lengthMilliseconds: 35444,
        mimeType: MIMEType.mp3,
    },
    {
        id: '79',
        title: 'good video (language title)',
        titleEnglish: 'good video (English title)',
        url: 'https:/www.webflix.org/feature-length.mp4',
        lengthMilliseconds: 230000,
        mimeType: MIMEType.mp4,
    },
];
