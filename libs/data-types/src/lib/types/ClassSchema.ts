import { SimpleCoscradPropertyTypeDefinition } from './SimpleCoscradPropertyTypeDefinition';

// TODO consolidate with api-interfaces
// eslint-disable-next-line
export type ClassSchema<T extends Record<string, unknown> = any> = Record<
    keyof T,
    SimpleCoscradPropertyTypeDefinition
>;
