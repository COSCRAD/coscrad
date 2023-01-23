import { isString } from './is-string';

const allowedProtocols = ['http:', 'https:'];

// https://nodejs.org/latest-v16.x/api/url.html
// https://www.rfc-editor.org/rfc/rfc3986
const isStringAValidUrl = (input: string): boolean => {
    try {
        const url = new URL(input);

        const { protocol } = url;

        if (!allowedProtocols.includes(url.protocol)) {
            throw new Error(`Invalid protocol: ${protocol} in URL: ${input}`);
        }

        return true;
    } catch (_error) {
        return false;
    }
};

export const isURL = (input: unknown) => isString(input) && isStringAValidUrl(input);
