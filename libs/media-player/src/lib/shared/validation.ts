export const isUndefined = (input: unknown): input is undefined => typeof input === 'undefined';

export const isNull = (input: unknown): input is null => input === null;

export const isNullOrUndefined = (input: unknown): input is null | undefined =>
    isNull(input) || isUndefined(input);

export const isNonNegative = (input: number): boolean => input >= 0;

export const isNumber = (input: unknown): input is number => {
    if (typeof input !== 'number') return false;

    // Let's avoid JavaScripts past blunders.
    if (Number.isNaN(input)) return false;

    return true;
};

export const isNonNegativeFiniteNumber = (input: unknown): input is number =>
    isNumber(input) && isNonNegative(input) && isFinite(input);

export const isInteger = (input: unknown): input is number =>
    isNumber(input) && Number.isInteger(input);
