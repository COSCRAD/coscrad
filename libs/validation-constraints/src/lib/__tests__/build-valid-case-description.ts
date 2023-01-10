export const buildValidCaseDescription = (value: unknown): string =>
    `when the value (${JSON.stringify(value)}) satisfies the constraint`;
