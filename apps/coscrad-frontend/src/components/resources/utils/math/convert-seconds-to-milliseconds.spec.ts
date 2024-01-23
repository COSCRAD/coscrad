import { convertSecondsToMilliseconds } from './convert-seconds-to-milliseconds';

const secondsToConvert = 23.4587;

describe('convertSecondsToMilliseconds', () => {
    it('should return the value in milliseconds of the inputted number', () => {
        const secondsConvertedToMilliseconds = convertSecondsToMilliseconds(secondsToConvert);

        expect(secondsConvertedToMilliseconds).toEqual(23459);
    });
});
