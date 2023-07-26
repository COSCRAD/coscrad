import { ISongViewModel } from '@coscrad/api-interfaces';
import { buildMultilingualTextFromEnglishOriginal } from '../../../notes/test-utils';

export const buildDummySongs = (): ISongViewModel[] => [
    {
        id: '12',
        title: 'ba ba ba',
        titleEnglish: 'cool song',
        name: buildMultilingualTextFromEnglishOriginal('ba ba ba'),
        lyrics: buildMultilingualTextFromEnglishOriginal(
            'go sing ba, ba, ba, ba, ba, ba, ba, ba, ba'
        ),
        lengthMilliseconds: 100000,
        startMilliseconds: 0,
        audioURL: 'https://www.coolsongs.org/bababa.mp3',
    },
    {
        id: '13',
        title: 'la la la',
        name: buildMultilingualTextFromEnglishOriginal('la la la'),
        lyrics: buildMultilingualTextFromEnglishOriginal(
            'go sing la, la, la, la, la, la, la, la, la'
        ),
        lengthMilliseconds: 655500,
        startMilliseconds: 5000,
        audioURL: 'https://www.coolsongs.org/lalala.mp3',
    },
];
