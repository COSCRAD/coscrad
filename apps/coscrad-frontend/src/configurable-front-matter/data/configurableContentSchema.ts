import { CoscradDataType, FromCoscradDataType } from '@coscrad/api-interfaces';

/**
 * We may want to refactor this to include the standard
 * `isOptional` and `isArray` options, in which case the values
 * below should be complex objects, not strings.
 */
export const configurableContentSchema = {
    siteTitle: CoscradDataType.NonEmptyString,
    subTitle: CoscradDataType.NonEmptyString,
    about: CoscradDataType.NonEmptyString,
    siteDescription: CoscradDataType.NonEmptyString,
    copyrightHolder: CoscradDataType.NonEmptyString,
} as const;

export type ConfigurableContentSchema = typeof configurableContentSchema;

export type ConfigurableContent = {
    [K in keyof typeof configurableContentSchema]: FromCoscradDataType<
        typeof configurableContentSchema[K]
    >;
};
