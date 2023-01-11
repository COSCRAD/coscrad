const stringify = (input: unknown): string => {
    if (Number.isNaN(input)) return '<NaN>';

    if (input === Infinity) return '<Infinity>';

    if (input === -Infinity) return '<-Infinity>';

    return JSON.stringify(input);
};

export const buildValidCaseDescription = (value: unknown): string =>
    `when the value (${stringify(value)}) satisfies the constraint`;
