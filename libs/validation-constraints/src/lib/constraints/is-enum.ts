export const isEnum = <T extends string>(
    EnumObject: Record<string, T>,
    input: unknown
): input is T => Object.values(EnumObject).includes(input as T);
