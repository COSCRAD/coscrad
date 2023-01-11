import { isNumber } from './is-number';

export const isFiniteNumber = (input: unknown): input is number =>
    isNumber(input) && isFinite(input);
