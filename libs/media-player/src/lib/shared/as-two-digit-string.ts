import { isInteger, isNonNegativeFiniteNumber } from './validation';

/**
 *
 * @param inputNumber non-negative integer less than 100
 * @returns string
 */
export const asTwoDigitString = (inputNumber: number) => {
    if (
        !isNonNegativeFiniteNumber(inputNumber) ||
        !isInteger(inputNumber) ||
        inputNumber.toString().length > 2
    ) {
        throw new Error('inputNumber must be a non-negative finite integer that is less than 100');
    }

    const inputAsString = inputNumber.toString();

    return inputNumber > 9 ? inputAsString : `0${inputAsString}`;
};
