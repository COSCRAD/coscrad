export const isNullOrUndefined = (input: unknown): input is null | undefined =>
    input === null || typeof input === 'undefined';
