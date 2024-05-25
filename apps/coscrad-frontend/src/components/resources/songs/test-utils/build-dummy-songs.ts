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
        audioURL: 'https://www.coolsongs.org/bababa.mp3',
        contributions: ['JJ Cool'],
    },
    {
        id: '13',
        title: 'la la la',
        name: buildMultilingualTextFromEnglishOriginal('la la la'),
        lyrics: buildMultilingualTextFromEnglishOriginal(
            'go sing la, la, la, la, la, la, la, la, la'
        ),
        lengthMilliseconds: 655500,
        audioURL: 'https://www.coolsongs.org/lalala.mp3',
        contributions: ['Ra Lala', 'Sue States'],
    },
];
