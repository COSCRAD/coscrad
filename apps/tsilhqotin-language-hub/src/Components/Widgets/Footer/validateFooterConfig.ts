import { FooterConfig } from './footer.config';
import { validateSocialMediaLinks } from './validateSocialMediaLinks';

export const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

export const validateFooterConfig = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    if (typeof input === 'undefined') return [new Error(`footer config is undefined`)];

    if (input === null) return [new Error(`footer config is null`)];

    const {
        parentOrganization,
        parentOrganizationWebLogoUrl,
        parentOrganizationSecondaryWebLogoUrl,
        socialMediaLinks,
    } = input as FooterConfig;

    if (!isStringWithNonzeroLength(parentOrganization))
        allErrors.push(
            new Error(
                `invalid config property: parentOrganization. Expected non empty string. Received ${parentOrganization}`
            )
        );

    if (!isStringWithNonzeroLength(parentOrganizationWebLogoUrl))
        allErrors.push(
            new Error(
                `invalid config property: parentOrganizationWebLogoUrl. Expected Url. Received ${parentOrganizationWebLogoUrl}`
            )
        );

    if (!isStringWithNonzeroLength(parentOrganizationSecondaryWebLogoUrl))
        allErrors.push(
            new Error(
                `invalid config property: parentOrganizationWebLogoUrl. Expected Url. Received ${parentOrganizationSecondaryWebLogoUrl}`
            )
        );

    allErrors.push(...validateSocialMediaLinks(socialMediaLinks));

    return allErrors;
};
