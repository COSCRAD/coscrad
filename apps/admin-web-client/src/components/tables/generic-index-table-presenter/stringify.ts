export const stringify = (value: unknown): string =>
    /**
     * Default presentation for unknown values. Defer to JSON.stringify and then
     * remove leading and trailing double quotes.
     *
     * Sonar Cloud says this pattern is more explicit than `/^"|"$/g`
     */
    JSON.stringify(value).replace(/(?:^")|(?:"$)/g, '');
