import { isDeepStrictEqual } from 'util';
import { isPrimitiveType } from './is-primititve-type';

export const doesDeepAnyPropertyEqual =
    (value: unknown) =>
    (input: unknown): boolean => {
        // The use case is to look for a string or number deeply somewhere in an object
        if (!isPrimitiveType(value)) {
            throw new Error(
                `Deep comparison against a non-primitive value is not supported (received: ${value})`
            );
        }

        // value === input would suffice here, since we know value is primitive
        if (isDeepStrictEqual(value, input)) return true;

        // at this point, there's no match
        if (isPrimitiveType(input)) return false;

        if (typeof input === 'function') return false;

        const predicate = doesDeepAnyPropertyEqual(value);

        // Recurse on Arrays
        if (Array.isArray(input)) return input.some(predicate);

        // Recurse on Objects
        return Object.values(input as object).some(predicate);
    };
