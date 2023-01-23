import { isNumber } from './is-number';

export const isNonNegativeNumber = (input: unknown): input is number =>
    isNumber(input) && input >= 0;
