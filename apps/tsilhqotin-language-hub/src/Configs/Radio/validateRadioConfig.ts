import { RadioConfig } from './radio.config';

export const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

export const validateRadioConfig = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    if (typeof input === 'undefined') return [new Error(`Radio config is undefined`)];

    if (input === null) return [new Error(`radio config is null`)];

    const { radioAudioUrl, radioLogoUrl, radioMissionStatement } = input as RadioConfig;

    if (!isStringWithNonzeroLength(radioAudioUrl))
        allErrors.push(
            new Error(
                `invalid config property: radioAudioUrl. Expected non empty string. Received ${radioAudioUrl}`
            )
        );

    if (!isStringWithNonzeroLength(radioLogoUrl))
        allErrors.push(
            new Error(
                `invalid config property: radioLogoUrl. Expected non empty string. Received ${radioLogoUrl}`
            )
        );

    if (!isStringWithNonzeroLength(radioMissionStatement))
        allErrors.push(
            new Error(
                `invalid config property: radioMissionStatement. Expected non empty string. Received ${radioMissionStatement}`
            )
        );

    return allErrors;
};
