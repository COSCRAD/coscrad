/**
 * The values here are meant to be human-readable labels and should complete the
 * sentence "Must be a valid _____"
 */
export enum CoscradConstraint {
    isNonEmptyString = 'non-empty string',
    // i.e. not `null` or `undefined`
    isDefined = 'defined',
    isObject = 'object',
    isInteger = 'integer',
    isYear = 'year',
    isBoolean = 'boolean',
    isUUID = 'UUID',
    isISBN = 'ISBN',
    isFiniteNumber = 'finite number',
    isNonNegative = 'non-negative number',
    isPositive = 'positive number',
    isURL = 'URL',
}
