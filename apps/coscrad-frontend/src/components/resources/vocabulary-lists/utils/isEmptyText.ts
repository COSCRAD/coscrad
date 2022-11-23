export const isEmptyText = (input: string | null | undefined): boolean =>
    input === null || typeof input === 'undefined' || input === '';
