export const isFinite = (input: number) =>
    input !== Infinity && input !== -Infinity && !isNaN(input);
