import { buildMessage, isInt, ValidateBy, ValidationOptions } from 'class-validator';

export const isPositiveInteger = (test: unknown): test is number => isInt(test) && test > 0;

export function IsPositiveInteger(validationOptions?: ValidationOptions) {
    return ValidateBy({
        name: isPositiveInteger.name,
        validator: {
            validate: (value, _): boolean => isPositiveInteger(value),
            defaultMessage: buildMessage(
                (eachPrefix) => eachPrefix + '$property must be a positive integer',
                validationOptions
            ),
        },
    });
}
