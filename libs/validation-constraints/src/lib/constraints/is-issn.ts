import { isString } from './is-string';

const issn = '^\\d{4}-?\\d{3}[\\dX]$';

const require_hyphen = false;

const case_sensitive = false;

/**
 * See Validator.js
 * https://github.com/validatorjs/validator.js/blob/master/src/lib/isISSN.js
 */
export const isISSN = (input: unknown) => {
    if (!isString(input)) return false;

    const testIssn = require_hyphen ? issn.replace('?', '') : issn;

    const regExp: RegExp = case_sensitive ? new RegExp(testIssn) : new RegExp(testIssn, 'i');

    if (!regExp.test(input)) {
        return false;
    }
    const digits = input.replace('-', '').toUpperCase();
    let checksum = 0;
    for (let i = 0; i < digits.length; i++) {
        const digit = digits[i];
        checksum += (digit === 'X' ? 10 : +digit) * (8 - i);
    }
    return checksum % 11 === 0;
};
