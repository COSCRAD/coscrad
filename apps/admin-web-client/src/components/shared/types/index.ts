export interface CommandResponse {
    type: string;
    id: string;
    revision: string;
}

export interface CommandFsa {
    type: string;
    payload: unknown;
}

export const NOT_FOUND: unique symbol = Symbol('searched, but no result was found');

export type NOT_FOUND = typeof NOT_FOUND;

export * from './functional-component';
