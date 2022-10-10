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
    Year = 'YEAR',
    PositiveInteger = 'POSITIVE_INTEGER',
    ISBN = 'ISBN',
}

export const isCoscradDataType = (input: unknown): input is CoscradDataType =>
    Object.values(CoscradDataType).includes(input as CoscradDataType);

export { CoscradDataType };
