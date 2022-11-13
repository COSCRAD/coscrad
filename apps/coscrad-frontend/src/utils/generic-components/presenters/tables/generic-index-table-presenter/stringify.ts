export const stringify = (value: unknown): string => JSON.stringify(value).replace(/^"|"$/g, '');
