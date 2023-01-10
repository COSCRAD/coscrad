import { isYear } from '@coscrad/validation-constraints';
import { buildMessage, ValidateBy, ValidationOptions } from 'class-validator';

export function IsYear(validationOptions?: ValidationOptions) {
    return ValidateBy({
        name: isYear.name,
        validator: {
            validate: (value, _): boolean => isYear(value),
            defaultMessage: buildMessage(
                (eachPrefix) =>
                    eachPrefix + '$property must be a year between 0 and the current year',
                validationOptions
            ),
        },
    });
}
