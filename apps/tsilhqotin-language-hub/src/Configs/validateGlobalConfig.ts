import { isNotEmptyObject, isObject, isUUID } from 'class-validator';
import { GlobalConfig } from './global.config';
import { consolidateMessagesForErrors, createArrayValidator } from './utils';
import { validateExternalLink } from './validateExternalLink';
import { validateFunderInfos } from './validateFunderInfos';

export const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

const validateCreditsLookupTable = (input: unknown): input is Record<string, string> => {
    if (!isObject(input) || !isNotEmptyObject(input)) return false;

    return Object.entries(input).every(
        ([key, value]) => isUUID(key) && isStringWithNonzeroLength(value)
    );
};

export const validateGlobalConfig = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    if (typeof input === 'undefined') return [new Error(`global config is undefined`)];

    if (input === null) return [new Error(`global config is null`)];

    const { funderInfos, linkInfos, siteTitle, songIdToCredits, videoIdToCredits } =
        input as GlobalConfig;

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

    const isSongCreditsValid = validateCreditsLookupTable(songIdToCredits);

    if (!isSongCreditsValid)
        allErrors.push(new Error(`Invalid song credits: ${JSON.stringify(songIdToCredits)}`));

    const isVideoCreditsValid = validateCreditsLookupTable(videoIdToCredits);

    if (!isVideoCreditsValid)
        allErrors.push(new Error(`Invalid song credits: ${JSON.stringify(videoIdToCredits)}`));

    return allErrors;
};
