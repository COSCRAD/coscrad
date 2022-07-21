import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export const isNonNegativeFiniteNumber = (input: unknown): input is number =>
    typeof input === 'number' && input >= 0 && input !== Infinity;

export function IsNonNegativeFiniteNumber(validationOptions?: ValidationOptions) {
    return ValidateBy({
        name: isNonNegativeFiniteNumber.name,
        validator: {
            validate: (value, _): boolean => isNonNegativeFiniteNumber(value),
            defaultMessage: buildMessage(
                (eachPrefix) => eachPrefix + '$property must be a non-negative, finite number',
                validationOptions
            ),
        },
    });
}
