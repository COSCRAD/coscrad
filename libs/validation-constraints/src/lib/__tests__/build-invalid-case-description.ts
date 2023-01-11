export const buildInvalidCaseDescription = (value: unknown): string =>
    `when the value (${JSON.stringify(value)}) does not satisfy the constraint`;
