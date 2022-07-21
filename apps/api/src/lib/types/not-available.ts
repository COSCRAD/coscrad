export const NotAvailable: unique symbol = Symbol('Resource exists, but is not available');

export type NotAvailable = typeof NotAvailable;

export const isNotAvailable = (input: unknown): input is NotAvailable => input === NotAvailable;
