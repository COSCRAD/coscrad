import { ConfigSchema } from '../validation/buildConfigValidationFunction';

export const NON_EMPTY_STRING = 'NON_EMPTY_STRING';

/**
 * We may want to refactor this to include the standard
 * `isOptional` and `isArray` options, in which case the values
 * below should be complex objects, not strings.
 */
export const configSchema: ConfigSchema = {
    siteTitle: NON_EMPTY_STRING,
    subTitle: NON_EMPTY_STRING,
    about: NON_EMPTY_STRING,
    siteDescription: NON_EMPTY_STRING,
    copyrightHolder: NON_EMPTY_STRING,
};

export type ConfigurableContent = {
    // TODO We need a mapped type from CoscraDataType to TypeScript types
    [K in keyof typeof configSchema]: typeof configSchema[K] extends string ? string : never;
};
