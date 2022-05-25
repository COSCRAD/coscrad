import { buildMessage, isInt, ValidateBy, ValidationOptions } from 'class-validator';

const currentYear = new Date().getFullYear();

export const isYear = (test: unknown): test is number =>
    typeof test === 'number' && test > 0 && test < currentYear && isInt(test);

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
