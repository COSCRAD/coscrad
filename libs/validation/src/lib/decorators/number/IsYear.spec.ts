import { checkInvalidValues, checkValidValues } from '../string/IsStringWithNonzeroLength.spec';
import { IsYear } from './IsYear';

describe('IsYear', () => {
    class TestClass {
        @IsYear()
        testProperty: number;
    }

    const validValues = [2021, 1344, 1844, 1923];

    const invalidValues = ['3887', 560000, '2021', [1988]];

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
