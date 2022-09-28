import { FunderInfo } from './global.config';
import { isStringWithNonzeroLength } from './validateGlobalConfig';

export const validateFunderInfo = (input: unknown): Error[] => {
    const allErrors: Error[] = [];

    const { name, url, description, category } = input as FunderInfo;

    console.log({
        funderInfoToValidate: input,
    });

    if (!isStringWithNonzeroLength(name))
        allErrors.push(new Error(`property: name of funderLinks must be a non empty string`));

    if (!isStringWithNonzeroLength(url))
        allErrors.push(new Error(`property: url of funderLinks must be a non empty string`));

    if (!isStringWithNonzeroLength(description))
        allErrors.push(
            new Error(`property: descsription of funderLinks must be a non empty string`)
        );

    if (!isStringWithNonzeroLength(category))
        allErrors.push(new Error(`property: category of funderLinks must be a non empty string`));

    return allErrors;
};
