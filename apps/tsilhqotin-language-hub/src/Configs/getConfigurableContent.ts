import { GlobalConfig } from './global.config';
import rawData from './global.config.json';
import { validateGlobalConfig } from './validateGlobalConfig';

const combineErrorMessages = (errors: Error[]): string =>
    errors.map(({ message }) => message).join('\n');

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
    const validationErrors = validateGlobalConfig(rawData);

    if (validationErrors.length > 0) {
        // Fail fast
        throw new Error(
            `Invalid content config encountered. \n Errors: ${combineErrorMessages(
                validationErrors
            )}`
        );
    }

    // Since the validation was successful, we assert the type of the result.
    return rawData as unknown as GlobalConfig;
};
