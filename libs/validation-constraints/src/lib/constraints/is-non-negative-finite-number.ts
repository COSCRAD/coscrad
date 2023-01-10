import { isNonNegative } from './is-non-negative';
import { isNumber } from './is-number';

export const isNonNegativeFiniteNumber = (input: unknown): input is number =>
    isNumber(input) && isNonNegative(input) && isFinite(input);
