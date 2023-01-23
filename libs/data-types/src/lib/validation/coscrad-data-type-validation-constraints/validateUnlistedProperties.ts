export const validateUnlistedProperties = (
    input: object,
    knownPropertyNames: string[],
    { forbidUnknownValues }: { forbidUnknownValues: boolean }
): Error[] => {
    // should we allow unlisted property keys' values through?
    if (!forbidUnknownValues) return [];

    const allErrors = Object.keys(input)
        .filter((inputKey) => !knownPropertyNames.includes(inputKey))
        .map(
            (invalidPropertyName) =>
                new Error(`The property ${invalidPropertyName} is not a known property name`)
        );

    return allErrors;
};
