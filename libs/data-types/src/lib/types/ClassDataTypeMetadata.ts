import { PropertyTypeMetadata } from './PropertyTypeMetadata';

// eslint-disable-next-line
export type ClassDataTypeMetadata<T extends Record<string, unknown> = any> = Record<
    keyof T,
    PropertyTypeMetadata
>;
