import { isNumber } from './is-number';
import { isNumericRange } from './is-numeric-range';

// TODO Consider throwing if the passed range is not in the right order, and test this
export const isNumberWithinRange = (
    input: unknown,
    [startInclusive, endInclusive]: [number, number]
): input is number => {
    if (!isNumericRange([startInclusive, endInclusive]))
        throw new Error(`Encountered an invalid range: [${startInclusive},${endInclusive}]`);

    return isNumber(input) && startInclusive <= input && input <= endInclusive;
};
