import { isEnum, isURL } from 'class-validator';
import { isStringWithNonzeroLength } from '../../../../../../../libs/validation/src';
import AppInfo from './AppInfo';
import AppLink from './AppLink';
import { AppPlatform } from './AppPlatform';
import rawData from './apps.config.json';

const unpackErrors = (errors: Error[]): string =>
    errors.reduce((msg, error) => `${msg}\n${error.message}`, '');

const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

const validateAppLink = (input: unknown): AppLink | Error[] => {
    const { url, platform } = input as AppLink;

    const allErrors: Error[] = [];

    if (!isURL(url))
        allErrors.push(
            new Error(`App info: \nApp Link: url must be a valid URL. Received: ${url}`)
        );

    if (!isEnum(platform, AppPlatform))
        allErrors.push(
            new Error(
                `App info: \nApp link: platform must be one of: ${Object.values(
                    AppPlatform
                )}. Received: ${platform}`
            )
        );

    if (allErrors.length > 0) return allErrors;

    return input as AppLink;
};

const validateAppInfo = (input: unknown): AppInfo | Error[] => {
    const { name, image, description, meta, links } = input as AppInfo;

    const allErrors: Error[] = [];

    if (!isStringWithNonzeroLength(name))
        allErrors.push(new Error(`App info: name must be a string`));

    if (!isURL(image)) allErrors.push(new Error(`App info: image must be a valid URL`));

    if (!isStringWithNonzeroLength(description))
        allErrors.push(new Error(`App info: description must be a non empty string`));

    if (!isStringWithNonzeroLength(meta))
        allErrors.push(new Error(`App info: meta must be a non empty string`));

    if (!Array.isArray(links)) {
        allErrors.push(new Error(`App info: links must be an array`));
    } else {
        const linkErrors = links.reduce((allErrors: Error[], link: AppLink, index: number) => {
            const linkValidationResult = validateAppLink(link);

            if (isErrorArray(linkValidationResult))
                return allErrors.concat(
                    new Error(
                        `Invalid link at index: ${index}. \nErrors: ${unpackErrors(
                            linkValidationResult
                        )}`
                    )
                );

            return allErrors;
        }, []);

        allErrors.push(...linkErrors);
    }

    if (allErrors.length > 0) return allErrors;

    return input as AppInfo;
};

/**
 * TODO validate the raw data first.
 */
export default (): AppInfo[] | Error => {
    if (!Array.isArray(rawData))
        return new Error(`Invalid app info config: expected array, received: ${rawData}`);

    const validationErrors = rawData.reduce((allErrors, item) => {
        const validationResult = validateAppInfo(item);

        if (isErrorArray(validationResult)) return allErrors.concat(validationResult);

        return allErrors;
    }, []);

    if (validationErrors.length > 0) {
        const msg = validationErrors.reduce(
            (acc, nextError) => acc + `\n${nextError.message}`,
            `Invalid app info config encountered. Errors: `
        );

        return new Error(msg);
    }

    return rawData as AppInfo[];
};
