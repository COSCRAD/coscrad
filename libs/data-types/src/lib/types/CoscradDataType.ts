enum CoscradDataType {
    NonEmptyString = 'NON_EMPTY_STRING',
    UUID = 'UUID',
    URL = 'URL',
    NonNegativeFiniteNumber = 'NON_NEGATIVE_FINITE_NUMBER',
    // This should be used for "CREATE" command payloads only
    RawData = 'RAW_DATA',
    /**
     * An enum will correspond to a static dropdown select. The `EnumMetadata`
     * type provides the client with the info required to render this. It is important
     * that you register user-facing labels for each custom enum.
     */
    Enum = 'Enum',
}

export default CoscradDataType;
