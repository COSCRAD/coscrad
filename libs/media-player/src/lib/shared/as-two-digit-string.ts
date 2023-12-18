import { isInteger, isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';

/**
 *
 * @param inputNumber non-negative finite number less than 100
 * @returns string
 */

export const asTwoDigitString = (inputNumber: number) => {
    if (!isNonNegativeFiniteNumber(inputNumber) || inputNumber > 99) {
        throw new Error('inputNumber must be a non-negative finite number that is less than 100');
    }

    const inputAsString = inputNumber.toString();

    if (!isInteger(inputNumber)) return inputAsString;

    return inputNumber > 9 ? inputAsString : `0${inputAsString}`;
};
