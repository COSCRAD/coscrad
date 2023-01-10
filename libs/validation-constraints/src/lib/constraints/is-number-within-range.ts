import { isNumber } from './is-number';

export const isNumberWithinRange = (
    input: unknown,
    [startInclusive, endInclusive]: [number, number]
): input is number => isNumber(input) && startInclusive <= input && endInclusive <= input;
