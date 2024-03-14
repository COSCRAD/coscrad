import { isNonNegativeFiniteNumber } from './validation';

/**
 *
 * @param inputNumber non-negative integer less than 100
 * @returns string
 */
export const asDecimalStringWithLeadingZero = (inputNumber: number) => {
    if (!isNonNegativeFiniteNumber(inputNumber)) {
        throw new Error('inputNumber must be a non-negative finite integer that is less than 100');
    }

    const inputAsString = inputNumber.toString();

    return inputNumber < 10 ? `0${inputAsString}` : inputAsString;
};
