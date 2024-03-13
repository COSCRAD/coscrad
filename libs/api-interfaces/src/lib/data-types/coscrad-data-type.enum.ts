export enum CoscradDataType {
    String = 'STRING',
    NonEmptyString = 'NON_EMPTY_STRING',
    UUID = 'UUID',
    URL = 'URL',
    FiniteNumber = 'FINITE_NUMBER',
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
    Month = 'MONTH',
    PositiveInteger = 'POSITIVE_INTEGER',
    ISBN = 'ISBN',
    Boolean = 'BOOLEAN',
    // TODO How does this fit within the constraint-based validation scheme?
    FixedValue = 'FIXED_VALUE',
    PageNumber = 'PAGE_NUMBER',
}

export const isCoscradDataType = (input: unknown): input is CoscradDataType =>
    Object.values(CoscradDataType).includes(input as CoscradDataType);
