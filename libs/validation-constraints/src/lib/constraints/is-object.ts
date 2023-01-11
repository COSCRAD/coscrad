import { isNull } from './is-null';

/**
 *
 * @param input value to validate
 * @returns true if the input is a non-array, non-function, non-null object
 * Note that the object may or may not have been built with a constructor.
 */
export const isObject = (input: unknown): input is object =>
    !isNull(input) && typeof input === 'object' && !Array.isArray(input);
