import { isString } from './is-string';

const uuidVersionToRegExp = {
    1: /^[0-9A-F]{8}-[0-9A-F]{4}-1[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    2: /^[0-9A-F]{8}-[0-9A-F]{4}-2[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    3: /^[0-9A-F]{8}-[0-9A-F]{4}-3[0-9A-F]{3}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
    4: /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    5: /^[0-9A-F]{8}-[0-9A-F]{4}-5[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i,
    all: /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}$/i,
};

/**
 * Adapted from `validator.js`.
 * https://github.com/validatorjs/validator.js/blob/master/src/lib/isUUID.js
 *
 * Here is the RFC standard:
 * https://www.rfc-editor.org/rfc/rfc4122.html
 */
export const isUUID = (input: unknown, version: keyof typeof uuidVersionToRegExp = 'all') => {
    if (!isString(input)) return false;

    const pattern = uuidVersionToRegExp[version];

    // Technically, we could throw a null check on pattern here, but let's trust the TS compiler and our extensive validation test coverage here
    return pattern.test(input);
};
