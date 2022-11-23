import { convertMillisecondsToSeconds } from './convert-milliseconds-to-seconds';

const millisecondsToConvert = 23890;

describe('convertMillisecondsToSeconds', () => {
    it('Should return the value in seconds of the inputted number', () => {
        const millisecondsConvertedToSeconds = convertMillisecondsToSeconds(millisecondsToConvert);

        expect(millisecondsConvertedToSeconds).toEqual(24);
    });
});
