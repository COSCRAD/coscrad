import { configSchema } from '../data/configSchema';
import { buildConfigValidationFunction } from './buildConfigValidationFunction';

export const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

export const validateConfigurableContent = (input: unknown): Error[] => {
    if (input === null || typeof input === 'undefined')
        return [new Error(`Encountered a null or undefined content config.`)];

    const simpleValidationResults = buildConfigValidationFunction(configSchema)(input);

    return simpleValidationResults;
};
