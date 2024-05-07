export const getDeepPropertyFromObject = <U, T>(input: T, propertyPath: string): U => {
    if (typeof input !== 'object') {
        return undefined;
    }

    if (propertyPath.includes('.')) {
        const splitOnSeparator = propertyPath.split('.');

        const [basePath, ...nestedPropertyPaths] = splitOnSeparator;

        const baseValue = input[basePath];

        return getDeepPropertyFromObject(baseValue, nestedPropertyPaths.join('.'));
    }

    return input[propertyPath];
};
