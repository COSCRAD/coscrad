import cloneToPlainObject from './cloneToPlainObject';

/**
 * This utility is meant to be used with plain objects (e.g. a DTO). If you use
 * it on an instance (an object with methods), it will remove the methods.
 *
 * @param object intended to be a plain object, not an instance
 * @param properties keys you would like to remove from the object
 * @returns a deep clone of the original object without the specified property
 * (and withought methods)
 */
export const clonePlainObjectWithoutProperties = <
    T extends Record<string, unknown>,
    UProperty extends keyof T
>(
    object: T,
    properties: UProperty[]
): Omit<T, UProperty> => {
    const clone = cloneToPlainObject(object);

    properties.forEach((property) => delete clone[property]);

    return clone;
};
