import { MediaTimeRange } from 'apps/api/src/domain/models/transcribed-audio/entities/MediaTimeRange';
import convertTimeRangeDataToPlainTextTranscript from './convertTimeRangeDataToPlainTextTranscript';

// TODO- add this to the test data and import it here!
const testTranscript: MediaTimeRange[] = [
    'Once upon a time, not long ago, there lived three dogs.',
    'Each of these dogs had a collar of a different color.',
    'One of these dogs did not obey his caller.',
    "This dog's collar was of a reddish color.",
    'One day the dog whose collar was a reddish color got into the collards',
    'to the spite of his caller.',
]
    .map((text, index) => ({
        inPoint: index * 500,
        outPoint: index * 500 + 400,
        data: text,
    }))
    .map((dto) => new MediaTimeRange(dto));

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
