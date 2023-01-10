import { isObject } from './is-object';

export const isNonEmptyObject = (input: unknown): input is object => {
    if (!isObject(input)) return false;

    return Object.keys(input).length > 0;
};
