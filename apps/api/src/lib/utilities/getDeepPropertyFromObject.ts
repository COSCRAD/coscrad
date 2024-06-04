export const getDeepPropertyFromObject = <U, T>(input: T, propertyPath: string): U => {
    if (typeof input !== 'object') {
        return undefined;
    }

    if (!propertyPath.includes('.')) {
        return input[propertyPath];
    }

    const splitOnSeparator = propertyPath.split('.');

    const [basePath, ...nestedPropertyPaths] = splitOnSeparator;

    const baseValue = input[basePath];

    // if the base property value is an array, we need to return an array from here
    if (Array.isArray(baseValue)) {
        return baseValue.map(
            (el) => getDeepPropertyFromObject(el, nestedPropertyPaths.join('.'))
            // TODO fix types
        ) as any;
    }

    return getDeepPropertyFromObject(baseValue, nestedPropertyPaths.join('.'));
};
