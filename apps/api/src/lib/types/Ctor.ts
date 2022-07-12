/**
 * TODO [https://www.pivotaltracker.com/story/show/182694263]
 * Move this to our utility types lib.
 */
export type Ctor<T> = new (...args: unknown[]) => T;
