import { buildSimpleValidationFunction } from '../../../../../../../../libs/validation/src';
import AppInfo from '../AppInfo';

// TODO Make this work. Currently we brute-force the validation
export default (input: unknown): AppInfo[] | Error[] => {
    const simpleValidationFunction = buildSimpleValidationFunction(AppInfo);

    if (!Array.isArray(input)) return [new Error(`App Info must be an array`)];

    const validationResult = input.flatMap(simpleValidationFunction);

    if (validationResult.length > 0)
        return validationResult.map((simpleError) => new Error(simpleError.toString()));

    return input as AppInfo[];
};
