import { ILoadable } from './loadable.interface';

export const NOT_FOUND: unique symbol = Symbol('searched, but no result was found');

export type NOT_FOUND = typeof NOT_FOUND;

export type IMaybeLoadable<T> = ILoadable<T | NOT_FOUND>;
