import { SimpleCoscradPropertyTypeDefinition } from './SimpleCoscradPropertyTypeDefinition';

// eslint-disable-next-line
export type ClassSchema<T extends Record<string, unknown> = any> = Record<
    keyof T,
    SimpleCoscradPropertyTypeDefinition
>;
