import configJson from './global.config.json';
import { validateGlobalConfig } from './validateGlobalConfig';

export type FunderInfo = {
    name: string;
    url: string;
    // Instead of using an enum for this, we will dynamically collect categories
    category: string; // e.g. language, radio, pastFunders
    description: string; // text to show the user inside th elink
};

export type LinkInfo = {
    name: string;
    url: string;
    category: string;
    description: string;
};

export type GlobalConfig = {
    siteTitle: string;
    funderInfos: FunderInfo[];
    // TODO Use this in the component
    linkInfos: LinkInfo[];
};

export function getGlobalConfig(): GlobalConfig {
    const rawConfig = configJson as unknown;

    const validationErrors = validateGlobalConfig(rawConfig);

    if (validationErrors.length > 0) {
        throw new Error(
            `Invalid global config: \n ${validationErrors.map(({ message }) => message).join('\n')}`
        );
    }

    return rawConfig as GlobalConfig;
}
