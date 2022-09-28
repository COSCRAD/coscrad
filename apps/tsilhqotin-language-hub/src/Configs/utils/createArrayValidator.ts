type ElementValidationFunction = (input: unknown) => Error[];

/**
 * Beware- this is curried.
 */
export const createArrayValidator =
    (elementValidationFunction: ElementValidationFunction, propertyName: string) =>
    (input: unknown): Error[] => {
        if (input === null) return [new Error(`property: ${propertyName} is null`)];

        if (input === undefined)
            return [new Error(`property: property: ${propertyName} is undefined`)];

        if (!Array.isArray(input))
            return [new Error(`property: property: ${propertyName} is a number`)];

        return (input as Error[]).flatMap(elementValidationFunction);
    };
