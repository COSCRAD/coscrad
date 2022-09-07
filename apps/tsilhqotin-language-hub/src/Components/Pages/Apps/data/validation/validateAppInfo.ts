import { isEnum, isURL } from 'class-validator';
import AppInfo from '../AppInfo';
import AppLink from '../AppLink';
import { AppPlatform } from '../AppPlatform';

// TODO Import this from the validation lib
const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

const unpackErrors = (errors: Error[]): string =>
    errors.reduce((msg, error) => `${msg}\n${error.message}`, '');

export const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

const validateAppLink = (input: unknown): AppLink | Error[] => {
    const { url, platform } = input as AppLink;

    const allErrors: Error[] = [];

    if (!isURL(url))
        allErrors.push(new Error(`App info: \nlinks: url must be a valid URL. Received: ${url}`));

    if (!isEnum(platform, AppPlatform))
        allErrors.push(
            new Error(
                `App info: \nlinks: platform must be one of: ${Object.values(
                    AppPlatform
                )}. Received: ${platform}`
            )
        );

    if (allErrors.length > 0) return allErrors;

    return input as AppLink;
};

export default (input: unknown): AppInfo | Error[] => {
    const { name, image, description, meta, links } = input as AppInfo;

    const allErrors: Error[] = [];

    if (!isStringWithNonzeroLength(name))
        allErrors.push(new Error(`App info: name must be a string. Received: ${name}`));

    if (!isURL(image))
        allErrors.push(new Error(`App info: image must be a valid URL. Received: ${image}`));

    if (!isStringWithNonzeroLength(description))
        allErrors.push(
            new Error(`App info: description must be a non empty string. Received: ${description}`)
        );

    if (!isStringWithNonzeroLength(meta))
        allErrors.push(new Error(`App info: meta must be a non empty string. Received: ${meta}`));

    if (!Array.isArray(links)) {
        allErrors.push(
            new Error(`App info: links must be an array. Received: ${JSON.stringify(links)}.`)
        );
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
