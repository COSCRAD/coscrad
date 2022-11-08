import { ISongViewModel } from '@coscrad/api-interfaces';

export const buildDummySongs = (): ISongViewModel[] => [
    {
        id: '12',
        title: 'ba ba ba',
        titleEnglish: 'cool song',
        lyrics: 'go sing ba, ba, ba, ba, ba, ba, ba, ba ,ba',
        contributions: [],
        lengthMilliseconds: 100000,
        startMilliseconds: 0,
        audioURL: 'https://www.coolsongs.org/bababa.mp3',
    },
    {
        id: '12',
        title: 'la la la',
        lyrics: 'go sing la, la, la, la, la, la, la, la ,la',
        contributions: [],
        lengthMilliseconds: 655500,
        startMilliseconds: 5000,
        audioURL: 'https://www.coolsongs.org/lalala.mp3',
    },
];
