import { asFormattedMediaTimecodeString } from './as-formatted-media-timecode-string';

const validCurrentTime = 42343.457;

const validTimecodeString = '11:45:43';

const invalidNegativeNumber = -23.88;

describe(`asFormattedMediaTimecodeString`, () => {
    describe(`when the inputed number is valid`, () => {
        it('should return a valid timecode string', () => {
            const result = asFormattedMediaTimecodeString(validCurrentTime);

            expect(result).toEqual(validTimecodeString);
        });
    });

    describe(`when the inputted number is negative`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(invalidNegativeNumber);
            }).toThrow('timeInSeconds must be a non-negative finite number');
        });
    });
});
