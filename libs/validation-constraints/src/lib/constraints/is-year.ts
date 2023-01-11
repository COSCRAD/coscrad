import { isInteger } from './is-integer';
import { isNumberWithinRange } from './is-number-within-range';

const EARLIEST_VALID_YEAR = 0;

const CURRENT_YEAR = new Date().getFullYear();

export const isYear = (input: unknown): input is number =>
    isInteger(input) && isNumberWithinRange(input, [EARLIEST_VALID_YEAR, CURRENT_YEAR]);
