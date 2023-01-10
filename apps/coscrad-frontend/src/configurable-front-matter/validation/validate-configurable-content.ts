import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { configurableContentSchema } from '../data/configurable-content-schema';
import { buildConfigValidationFunction } from './build-config-validation-function';

export const isErrorArray = (input: unknown): input is Error[] =>
    Array.isArray(input) && input.every((item) => item instanceof Error);

export const validateConfigurableContent = (input: unknown): Error[] => {
    if (isNullOrUndefined(input))
        return [new Error(`Encountered a null or undefined content config.`)];

    const simpleValidationResults = buildConfigValidationFunction(configurableContentSchema)(input);

    return simpleValidationResults;
};
