import { SocialMediaLink } from './footer.config';
import { isStringWithNonzeroLength } from './validateFooterConfig';

export const validateSocialMediaLink = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    const { platform, url } = input as SocialMediaLink;

    if (!isStringWithNonzeroLength(platform))
        allErrors.push(
            new Error(`property: platform of socialMediaLinks must be a non empty string`)
        );

    if (!isStringWithNonzeroLength(url))
        allErrors.push(new Error(`property: url of socialMediaLinks must be a non empty string`));

    //try on own
    if (!isStringWithNonzeroLength(url))
        allErrors.push(new Error(`property: url of socialMediaLinks must be a non empty string`));

    return allErrors;
};
