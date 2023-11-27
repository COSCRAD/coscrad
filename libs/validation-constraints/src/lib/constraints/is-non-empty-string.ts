export const isNonEmptyString = (input: unknown): input is string =>
    typeof input === 'string' && input.trim() !== '';
