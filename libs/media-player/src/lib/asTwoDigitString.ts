import { isInteger } from '@coscrad/validation-constraints';

export const asTwoDigitString = (inputNumber: number) => {
    const inputAsString = inputNumber.toString();

    if (!isInteger(inputNumber)) return inputAsString;

    return inputNumber > 9 ? inputAsString : `0${inputAsString}`;
};
