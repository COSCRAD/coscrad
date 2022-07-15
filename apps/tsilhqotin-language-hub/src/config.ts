import configJson from './config.json';

type Config = {
    apiBaseUrl: string;
};

// TODO import this from the validation lib
const isStringWithNonzeroLength = (input: unknown): input is string =>
    typeof input === 'string' && input.length > 0;

const isConfig = (input: unknown): input is Config => {
    const test = input as Config;

    return isStringWithNonzeroLength(test.apiBaseUrl);
};

export const getConfig = (): Config => {
    const rawConfig = configJson as unknown;

    if (!isConfig(rawConfig)) {
        throw new Error('invalid config');
    }

    return rawConfig;
};
