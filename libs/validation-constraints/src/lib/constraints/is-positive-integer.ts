import { isPositive } from 'class-validator';
import { isInteger } from './is-integer';

export const isPositiveInteger = (input: unknown): input is number =>
    isInteger(input) && isPositive(input);
