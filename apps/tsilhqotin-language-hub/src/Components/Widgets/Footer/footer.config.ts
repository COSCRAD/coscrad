import configJson from './footer.config.json';
import { validateFooterConfig } from './validateFooterConfig';

export type SocialMediaLink = {
    platform: string;
    url: string;
};

export type FooterConfig = {
    parentOrganization: string;
    parentOrganizationWebLogoUrl: string;
    parentOrganizationSecondaryWebLogoUrl: string;
    socialMediaLinks: SocialMediaLink[];
};

// TODO Move this to the global config
export function getFooterConfig(): FooterConfig {
    const rawConfig = configJson as unknown;

    const validationErrors = validateFooterConfig(rawConfig);

    if (validationErrors.length > 0) {
        throw new Error(
            `Invalid config. Errors:\n${validationErrors.map(({ message }) => message).join('\n')}`
        );
    }

    return rawConfig as FooterConfig;
}
