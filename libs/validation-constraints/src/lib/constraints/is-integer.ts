import { isNumber } from './is-number';

export const isInteger = (input: unknown): input is number =>
    isNumber(input) && Number.isInteger(input);
