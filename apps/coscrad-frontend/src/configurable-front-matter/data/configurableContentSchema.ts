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
    siteHomeImageUrl: CoscradDataType.NonEmptyString,
    copyrightHolder: CoscradDataType.NonEmptyString,
    organizationLogoUrl: CoscradDataType.NonEmptyString,
    // This is a hack. We need to represent contributors as a resource in our system and then use notes to relay this info
    // We may want to make this optional or allow an empty array
    songIdToCredits: CoscradDataType.RawData,
    // videoIdToCredits: CoscradDataType.RawData
} as const;

export type ConfigurableContentSchema = typeof configurableContentSchema;

export type ConfigurableContent = {
    [K in keyof typeof configurableContentSchema]: FromCoscradDataType<
        typeof configurableContentSchema[K]
    >;
};
