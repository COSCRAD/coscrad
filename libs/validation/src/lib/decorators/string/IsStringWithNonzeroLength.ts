import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const isStringWithNonzeroLength = (test: unknown): test is string =>
    typeof test === 'string' && test.length > 0;

export function IsStringWithNonzeroLength(validationOptions?: ValidationOptions) {
    return ValidateBy({
        name: isStringWithNonzeroLength.name,
        validator: {
            validate: (value, _): boolean => isStringWithNonzeroLength(value),
            defaultMessage: buildMessage(
                (eachPrefix) => eachPrefix + '$property must be a string with non-zero length',
                validationOptions
            ),
        },
    });
}
