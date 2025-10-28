/**
 * TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-341]
 * Move this to our utility types lib.
 */
export type Ctor<T> = new (...args: unknown[]) => T;
