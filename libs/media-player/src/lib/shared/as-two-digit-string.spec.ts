import { asTwoDigitString } from './as-two-digit-string';

const numberLessThanTen = 7;

const numberGreaterThanTen = 14;

const invalidNegativeNumber = -26;

const invalidNumberGreatThanOneHundred = 239;

const invalidDecimal = 43.2;

describe(`asTwoDigitString`, () => {
    describe(`when the inputted number is less than 10`, () => {
        it('should return a string value with zero as the first character', () => {
            const result = asTwoDigitString(numberLessThanTen);

            expect(result).toEqual(`0${numberLessThanTen.toString()}`);
        });
    });

    describe(`when the inputted number is greater than 10`, () => {
        it('should return a string value with the same digits as the number inputted', () => {
            const result = asTwoDigitString(numberGreaterThanTen);

            expect(result).toEqual(numberGreaterThanTen.toString());
        });
    });

    describe(`when the inputted number is negative`, () => {
        it('should throw an error', () => {
            expect(() => {
                asTwoDigitString(invalidNegativeNumber);
            }).toThrow('inputNumber must be a non-negative finite integer that is less than 100');
        });
    });

    describe(`when the inputted number is greater than 100`, () => {
        it('should throw an error', () => {
            expect(() => {
                asTwoDigitString(invalidNumberGreatThanOneHundred);
            }).toThrow('inputNumber must be a non-negative finite integer that is less than 100');
        });
    });

    describe(`when the inputted number is a decimal`, () => {
        it('should throw an error', () => {
            expect(() => {
                asTwoDigitString(invalidDecimal);
            }).toThrow('inputNumber must be a non-negative finite integer that is less than 100');
        });
    });
});
