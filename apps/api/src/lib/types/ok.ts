export const OK: unique symbol = Symbol('OK');

export type OK = typeof OK;

export const isOK = (input: unknown): input is OK => input === OK;
