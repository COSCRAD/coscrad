/**
 * This implementation is based on
 * [the following discussion](https://stackoverflow.com/questions/61132262/typescript-deep-partial)
 */
export type DeepPartial<T> = T extends object
    ? {
          [K in keyof T]?: DeepPartial<T[K]>;
      }
    : T;
