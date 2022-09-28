import { GlobalConfig } from './global.config';
import { consolidateMessagesForErrors, createArrayValidator } from './utils';
import { validateExternalLink } from './validateExternalLink';
import { validateFunderInfos } from './validateFunderInfos';

export const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

export const validateGlobalConfig = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    if (typeof input === 'undefined') return [new Error(`global config is undefined`)];

    if (input === null) return [new Error(`global config is null`)];

    const { funderInfos, linkInfos, siteTitle } = input as GlobalConfig;

    const funderLinksErrors = validateFunderInfos(funderInfos);

    if (!isStringWithNonzeroLength(siteTitle))
        allErrors.push(
            new Error(
                `Encountered invalid property: ${siteTitle}. Expected non-empty string, received value: ${siteTitle}`
            )
        );

    if (funderLinksErrors.length > 0)
        allErrors.push(
            new Error(
                `Encountered invalid property: funderLinks. \nErrors:${consolidateMessagesForErrors(
                    funderLinksErrors
                )}`
            )
        );

    const externalLinksErrors = createArrayValidator(
        validateExternalLink,
        'externalLinks'
    )(linkInfos);

    if (externalLinksErrors.length > 0)
        allErrors.push(
            new Error(
                `Encountered invalid property: externalLinks. \nErrors:${consolidateMessagesForErrors(
                    externalLinksErrors
                )}`
            )
        );

    return allErrors;
};
