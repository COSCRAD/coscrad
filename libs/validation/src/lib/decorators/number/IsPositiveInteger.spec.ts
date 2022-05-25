import { checkInvalidValues, checkValidValues } from '../string/IsStringWithNonzeroLength.spec';
import { IsPositiveInteger } from './IsPositiveInteger';

describe('IsPositiveInteger', () => {
    class TestClass {
        @IsPositiveInteger()
        testProperty: number;
    }

    const validValues = [100, 342, 1];

    const invalidValues = ['100', 0, -100, [342], Infinity, 23.45];

    describe('when the input is valid', () => {
        it('should return no validation errors', () => {
            return checkValidValues(new TestClass(), validValues);
        });
    });

    describe('when the input is invalid', () => {
        it('should return a validation error', () => {
            return checkInvalidValues(new TestClass(), invalidValues);
        });
    });
});
