import cloneToPlainObject from './cloneToPlainObject';

/**
 * This utility is meant to be used with plain objects (e.g. a DTO). If you use
 * it on an instance (an object with methods), it will remove the methods.
 *
 * @param object intended to be a plain object, not an instance
 * @param property key you would like to remove from the object
 * @returns a deep clone of the original object without the specified property
 * (and withought methods)
 */
const clonePlainObjectWithoutProperty = <
    T extends Record<string, unknown>,
    UProperty extends string
>(
    object: T,
    property: UProperty
): Omit<T, UProperty> => {
    const clone = cloneToPlainObject(object);

    delete clone[property];

    return clone;
};

export default clonePlainObjectWithoutProperty;
