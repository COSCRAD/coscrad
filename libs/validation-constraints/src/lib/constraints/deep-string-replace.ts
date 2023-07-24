import { isPrimitiveType } from './is-primititve-type';

export const deepStringReplace = <T>(
    originalStringValue: string,
    stringReplacementValue: string,
    input: T
): T => {
    if (input === originalStringValue) return stringReplacementValue as T;

    if (isPrimitiveType(input)) return input;

    if (Array.isArray(input))
        return input.map((element) =>
            deepStringReplace(originalStringValue, stringReplacementValue, element)
        ) as T;

    return Object.entries(input as any).reduce((acc: Partial<T>, [propertyKey, propertyValue]) => {
        // Recurse on object-valued property
        acc[propertyKey as keyof T] = deepStringReplace(
            originalStringValue,
            stringReplacementValue,
            propertyValue
        ) as T[keyof T];

        return acc as T;
    }, {}) as T;
};
