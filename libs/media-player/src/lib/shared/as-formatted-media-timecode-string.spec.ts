import { asFormattedMediaTimecodeString } from './as-formatted-media-timecode-string';

const validCurrentLongTime = 42343.457;

const validLongTimecodeString = '11:45:43.457';

const validCurrentShortTime = 253.99473;

// NOTE: we're using Math.floor() rather than Math.max() or Math.ceil()
const validShortTimecodeString = '00:04:13.995';

const ninetynineHoursInSecondsPlusOne = 99 * 60 * 60 + 1;

const invalidNegativeNumber = -23.88;

const invalidInfiniteNumber = Infinity;

const invalidNegativeInfiniteNumber = -Infinity;

const invalidNaN = Number.NaN;

describe(`asFormattedMediaTimecodeString`, () => {
    describe(`when the inputed number is a valid long time`, () => {
        it('should return a valid timecode string', () => {
            const result = asFormattedMediaTimecodeString(validCurrentLongTime);

            expect(result).toEqual(validLongTimecodeString);
        });
    });

    describe(`when the inputed number is a valid short time`, () => {
        it('should return a valid timecode string', () => {
            const result = asFormattedMediaTimecodeString(validCurrentShortTime);

            expect(result).toEqual(validShortTimecodeString);
        });
    });

    describe(`when the inputted number is negative`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(invalidNegativeNumber);
            }).toThrow(
                [
                    'timeInSeconds must be a non-negative finite number',
                    'representing a duration of less than 99 hours',
                ].join(' ')
            );
        });
    });

    describe(`when the inputted number is infinity`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(invalidInfiniteNumber);
            }).toThrow(
                [
                    'timeInSeconds must be a non-negative finite number',
                    'representing a duration of less than 99 hours',
                ].join(' ')
            );
        });
    });

    describe(`when the inputted number is negative infinity`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(invalidNegativeInfiniteNumber);
            }).toThrow(
                [
                    'timeInSeconds must be a non-negative finite number',
                    'representing a duration of less than 99 hours',
                ].join(' ')
            );
        });
    });

    describe(`when the inputted value is NaN`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(invalidNaN);
            }).toThrow(
                [
                    'timeInSeconds must be a non-negative finite number',
                    'representing a duration of less than 99 hours',
                ].join(' ')
            );
        });
    });

    describe(`when the inputted number is greater than the 99 hour max`, () => {
        it('should throw an error', () => {
            expect(() => {
                asFormattedMediaTimecodeString(ninetynineHoursInSecondsPlusOne);
            }).toThrow(
                [
                    'timeInSeconds must be a non-negative finite number',
                    'representing a duration of less than 99 hours',
                ].join(' ')
            );
        });
    });
});
