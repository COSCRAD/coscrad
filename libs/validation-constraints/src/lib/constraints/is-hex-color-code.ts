import { isNonEmptyString } from './is-non-empty-string';

export const isHexColorCode = (input: unknown): input is string => {
    if (!isNonEmptyString(input)) {
        return false;
    }

    if (!input.startsWith('#')) {
        return false;
    }

    const { length } = input;

    if (length !== 4 && length !== 7) {
        return false;
    }

    /**
     * A hex color code starts with # followed by either 3 or 6 alphanumberic characters
     */
    const pattern = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;

    return pattern.test(input);
};
