import { isPositiveInteger } from '@coscrad/validation-constraints';
import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

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
