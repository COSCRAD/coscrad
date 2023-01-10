export const isFunction = (input: unknown): input is (args: unknown) => unknown =>
    typeof input === 'function';
