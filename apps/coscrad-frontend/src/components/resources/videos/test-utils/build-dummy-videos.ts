import {
    IVideoViewModel,
    LanguageCode,
    MIMEType,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { buildMultilingualTextFromEnglishOriginal } from '../../../notes/test-utils';

const participantInitials = 'AP';

const idtoFind = '444';

const videoToFind: IVideoViewModel = {
    id: idtoFind,
    videoUrl: 'https://www.vidbox.org/123.mp4',
    lengthMilliseconds: 123000,
    contributions: ['Mark Inponne'],
    name: {
        items: [
            {
                role: MultilingualTextItemRole.original,
                languageCode: LanguageCode.Haida,
                text: 'Test Video Name in Haida',
            },
        ],
    },
    mimeType: MIMEType.mp4,
    transcript: {
        participants: [
            {
                initials: participantInitials,
                name: 'Albert Placke',
            },
            {
                initials: 'JB',
                name: 'James Brown',
            },
        ],
        items: [
            {
                inPointMilliseconds: 100,
                outPointMilliseconds: 2400,
                speakerInitials: participantInitials,
                text: buildMultilingualTextFromEnglishOriginal('this is what was said'),
            },
        ],
    },
};

export const buildDummyVideos = (): IVideoViewModel[] => [videoToFind];
