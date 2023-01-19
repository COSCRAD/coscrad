import { isString } from './is-string';

const allowedProtocols = ['http:', 'https:'];

// https://nodejs.org/latest-v16.x/api/url.html
// https://www.rfc-editor.org/rfc/rfc3986
const isStringAValidUrl = (input: string): boolean => {
    /**
     * The following is the desired implementation, but it requires polyfilling
     * global `URL` or some webpack magic to fix the build.
     */
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

    // Simple implementation from free-code camp. We should try to use the alternative above ASP.
    // const pattern = new RegExp(
    //     '^([a-zA-Z]+:\\/\\/)?' + // protocol
    //         '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    //         '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IP (v4) address
    //         '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    //         '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
    //         '(\\#[-a-z\\d_]*)?$', // fragment locator
    //     'i'
    // );
    // return pattern.test(input);
};

export const isURL = (input: unknown) => isString(input) && isStringAValidUrl(input);
