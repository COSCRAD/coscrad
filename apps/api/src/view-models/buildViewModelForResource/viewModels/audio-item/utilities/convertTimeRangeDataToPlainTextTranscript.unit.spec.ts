import {
    MultiLingualText,
    MultiLingualTextItemRole,
} from '../../../../../domain/common/entities/multi-lingual-text';
import { TranscriptItem } from '../../../../../domain/models/audio-item/entities/transcript-item.entity';
import convertTimeRangeDataToPlainTextTranscript from './convertTimeRangeDataToPlainTextTranscript';

// TODO- add this to the test data and import it here!
const testTranscript: TranscriptItem[] = [
    'Once upon a time, not long ago, there lived three dogs.',
    'Each of these dogs had a collar of a different color.',
    'One of these dogs did not obey his caller.',
    "This dog's collar was of a reddish color.",
    'One day the dog whose collar was a reddish color got into the collards',
    'to the spite of his caller.',
]
    .map((plainText, index) => ({
        inPoint: index * 500,
        outPoint: index * 500 + 400,
        text: new MultiLingualText({
            items: [
                {
                    text: plainText,
                    languageId: 'clc',
                    role: MultiLingualTextItemRole.original,
                },
            ],
        }),
        speakerInitials: 'FOO',
    }))
    .map((dto) => new TranscriptItem(dto));

describe('convertTimeRangeDataToPlainTextTranscript', () => {
    describe('when the input is an empty array', () => {
        it('should return an empty string', () => {
            const result = convertTimeRangeDataToPlainTextTranscript([]);

            expect(result).toBe('');
        });
    });

    describe('when given data for a sample transcript', () => {
        it('should produce the expected plain text', () => {
            const result = convertTimeRangeDataToPlainTextTranscript(testTranscript);

            expect(result).toMatchSnapshot();
        });
    });
});
