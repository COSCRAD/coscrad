// This might be useful in a utility types lib
type UnknownFunction = (args: unknown) => unknown;

export const isFunction = (input: unknown): input is UnknownFunction => typeof input === 'function';
