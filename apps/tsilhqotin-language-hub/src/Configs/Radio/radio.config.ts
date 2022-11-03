import configJson from './radio.config.json';
import { validateRadioConfig } from './validateRadioConfig';

export type RadioConfig = {
    radioAudioUrl: string;
    radioLogoUrl: string;
    radioMissionStatement: string;
};

export function getRadioConfig(): RadioConfig {
    const rawConfig = configJson as unknown;

    const validationErrors = validateRadioConfig(rawConfig);

    if (validationErrors.length > 0) {
        throw new Error(
            `Invalid config. Errors:\n${validationErrors.map(({ message }) => message).join('\n')}`
        );
    }

    return rawConfig as RadioConfig;
}
