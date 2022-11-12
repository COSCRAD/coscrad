/**
 * TODO Use these wrappers around `Reflect` in order to insulate against potential
 * API change.
 */
export const setMetadata = (key: string, value: unknown, target: unknown): void => {
    Reflect.defineMetadata(key, value, target);
};

export const getMetadata = <T = unknown>(key: string, target: unknown): T => {
    return Reflect.getMetadata(key, target);
};
