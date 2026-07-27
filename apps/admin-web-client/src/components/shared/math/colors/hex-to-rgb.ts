import { isNullOrUndefined } from '@coscrad/validation-constraints';

/**
 * https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
 *
 * TODO Add a unit test. Currently, we only use this to map expectations in
 * tests, so it's not very risky.
 */
export const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    if (isNullOrUndefined(result)) {
        throw new Error(`failed to parse the invalid hex value: ${hex} to rgb`);
    }

    const { r, g, b } = {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
    };

    return `rgb(${[r, g, b].join(', ')})`;
};
