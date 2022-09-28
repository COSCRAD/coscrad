import { FunderInfo } from './global.config';
import { validateFunderInfo } from './validateFunderInfo';

export const validateFunderInfos = (input: unknown): Error[] => {
    if (input === null) return [new Error(`funder links is null`)];

    if (input === undefined) return [new Error(`property: funder links is undefined`)];

    if (!Array.isArray(input)) return [new Error(`property: funder links is a number`)];
    console.log({ input });
    return (input as FunderInfo[]).flatMap(validateFunderInfo);
};
