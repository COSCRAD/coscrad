import { isString } from './is-string';

const allowedProtocols = ['http:', 'https:'];

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
