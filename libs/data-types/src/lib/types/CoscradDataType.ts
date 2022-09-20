enum CoscradDataType {
    NonEmptyString = 'NON_EMPTY_STRING',
    UUID = 'UUID',
    URL = 'URL',
    NonNegativeFiniteNumber = 'NON_NEGATIVE_FINITE_NUMBER',
    // This should be used for "CREATE" command payloads only
    RawData = 'RAW_DATA',
    /**
     * A composite identifier has a string `type` discriminator
     * and an `id`. The latter uniquely specifies the entity
     * amongst other entities of the same type.
     */
    CompositeIdentifier = 'COMPOSITE_IDENTIFIER',
    /**
     * An enum will correspond to a static dropdown select. The `EnumMetadata`
     * type provides the client with the info required to render this. It is important
     * that you register user-facing labels for each custom enum.
     */
    Enum = 'ENUM',
    Year = 'YEAR',
    PositiveInteger = 'POSITIVE_INTEGER',
    ISBN = 'ISBN',
    Union = 'UNION',
}

export const isCoscradDataType = (input: unknown): input is CoscradDataType =>
    Object.values(CoscradDataType).includes(input as CoscradDataType);

export { CoscradDataType };
