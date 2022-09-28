import { FunderInfo } from './global.config';
import { isStringWithNonzeroLength } from './validateGlobalConfig';

export const validateExternalLink = (input: unknown): Error[] => {
    const errors: Error[] = [];

    const { name, url } = input as FunderInfo;

    if (!isStringWithNonzeroLength(name))
        errors.push(new Error(`property: name of externalLinks must be a non empty string`));

    if (!isStringWithNonzeroLength(url))
        errors.push(new Error(`property: url of externalLinks must be a non empty string`));

    return errors;
};
