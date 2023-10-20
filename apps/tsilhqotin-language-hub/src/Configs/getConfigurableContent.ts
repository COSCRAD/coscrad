import { GlobalConfig } from './global.config';
import rawData from './global.config.json';

/**
 * This function
 * - reads the raw config data
 * - calls the validation function
 *     - throws an error if invalid
 *     - returns the result, asserting its type if valid
 *
 * Its sole purpose is to abstract this flow so that from the outside it feels as
 * though you are simply fetching the content config.
 */
export const getConfigurableContent = () => {
    /**
     * Note that we used to validate the content config when it was JSON. This is no
     * longer necessary, as it is now a TypeScript file.
     */

    return rawData as unknown as GlobalConfig;
};
