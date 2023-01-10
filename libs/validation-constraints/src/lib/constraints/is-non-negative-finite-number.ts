import { isNumber } from './is-number';

export const isNonNegativeFiniteNumber = (input: unknown): input is number =>
    isNumber(input) && input >= 0 && isFinite(input);
