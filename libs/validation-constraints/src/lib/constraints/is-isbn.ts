import { isString } from './is-string';

const isbn10Maybe = /^(?:[0-9]{9}X|[0-9]{10})$/;
const isbn13Maybe = /^(?:[0-9]{13})$/;
const factor = [1, 3];

/**
 * Implementation inspired by validator.js (subsequently refactored to our coding style using TDD)
 *
 * Section 3.1 of the following is helpful in understanding the structure of an ISBN:
 * https://www.rfc-editor.org/rfc/rfc2288
 */
// TODO[test-coverage]
export const isISBN = (input: unknown, version?: '10' | '13'): boolean => {
    if (!isString(input)) return false;

    if (!version) {
        return isISBN(input, '10') || isISBN(input, '13');
    }

    const sanitized = input.replace(/[\s-]+/g, '');

    let checksum = 0;

    let i;

    if (version === '10') {
        if (!isbn10Maybe.test(sanitized)) {
            return false;
        }
        for (i = 0; i < 9; i++) {
            checksum += (i + 1) * parseInt(sanitized.charAt(i));
        }
        if (sanitized.charAt(9) === 'X') {
            checksum += 10 * 10;
        } else {
            checksum += 10 * parseInt(sanitized.charAt(9));
        }
        if (checksum % 11 === 0) {
            return !!sanitized;
        }
    } else if (version === '13') {
        if (!isbn13Maybe.test(sanitized)) {
            return false;
        }
        for (i = 0; i < 12; i++) {
            checksum += factor[i % 2] * parseInt(sanitized.charAt(i));
        }
        if (parseInt(sanitized.charAt(12)) - ((10 - (checksum % 10)) % 10) === 0) {
            return !!sanitized;
        }
    }
    return false;
};
