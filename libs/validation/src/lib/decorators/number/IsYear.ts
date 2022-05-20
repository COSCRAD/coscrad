import { buildMessage, isInt, ValidateBy, ValidationOptions } from 'class-validator';

export const isYear = (test: unknown): test is number => 
    // TODO generate current year
    typeof test === 'number' && test > 0 && test < 2022 && isInt(test);

export function IsYear(validationOptions?: ValidationOptions) {
    return ValidateBy({
        name: isYear.name,
        validator: {
            validate: (value, _): boolean => isYear(value),
            defaultMessage: buildMessage(
                (eachPrefix) => eachPrefix + '$property must a year between 0 and the current year',
                validationOptions
            ),
        },
    })
}