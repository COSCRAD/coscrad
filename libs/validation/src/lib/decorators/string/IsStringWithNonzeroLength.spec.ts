import { validateSync, ValidationError, ValidationOptions } from 'class-validator';
import { IsStringWithNonzeroLength } from './IsStringWithNonzeroLength';

export type HasTestProperty = {
    testProperty: unknown;
};

/**
 * We use a similar approach to testing as they use in the core
 * [class-validator library](https://github.com/typestack/class-validator).
 *
 * One diffrence at present is that we use `validateSync` in our test helpers, as
 * this more closely resembles our use cases. We'll need to update these test
 * helpers to work with async if we eventually use `class-validator` for
 * async validation.
 */
export const checkValidValues = (
    object: HasTestProperty,
    validValues: unknown[],
    validationOptions?: ValidationOptions
) => {
    validValues.forEach((value) => {
        object.testProperty = value;

        const result = validateSync(object, validationOptions);

        expect(result).toEqual([]);
    });
};

export const checkInvalidValues = (
    object: HasTestProperty,
    invalidValues: unknown[],
    validationOptions?: ValidationOptions
) => {
    invalidValues.forEach((value) => {
        object.testProperty = value;

        const result = validateSync(object, validationOptions);

        if (result.length === 0) {
            throw new Error(`Invalid input raised no errors: ${value}`);
        }

        expect(result?.length).toBe(1);

        expect(result[0]).toBeInstanceOf(ValidationError);
    });
};

describe('IsStringWithNonzeroLength', () => {
    class TestClass {
        @IsStringWithNonzeroLength()
        testProperty: string;
    }

    const validValues = ['hello world', '350060', '#', 'ŝŵẑɨʔáéíóɨ́ú'];

    const invalidValues = ['', 700, [], { foo: 'wah' }];

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
