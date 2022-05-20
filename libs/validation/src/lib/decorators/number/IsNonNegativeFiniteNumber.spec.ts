import { checkInvalidValues, checkValidValues } from '../string/IsStringWithNonzeroLength.spec';
import { IsNonNegativeFiniteNumber } from './IsNonNegativeFiniteNumber';

describe(`IsNonNegativeFiniteNumber`, () => {
    class TestClass {
        @IsNonNegativeFiniteNumber()
        testProperty: number;
    }

    const validValues = [0, 99, 104.5, 33 / 7];

    const invalidValues = [-100, Infinity, -Infinity, -5 / 3, '99', [99], null, undefined];

    describe('when the input is valid', () => {
        it('should return no validation erors', () => {
            return checkValidValues(new TestClass(), validValues);
        });
    });

    describe('when the input is invalid', () => {
        it('should return a validation error', () => {
            return checkInvalidValues(new TestClass(), invalidValues);
        });
    });
});
