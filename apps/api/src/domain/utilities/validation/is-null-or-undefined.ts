/**
 * TODO Import these from `@coscrad/validation-constraints`
 */
export const isNull = (input: unknown): input is null => input === null;

export const isUndefined = (input: unknown): input is undefined => typeof input === 'undefined';

export const isNullOrUndefined = (input: unknown): input is null | undefined =>
    isNull(input) || isUndefined(input);
