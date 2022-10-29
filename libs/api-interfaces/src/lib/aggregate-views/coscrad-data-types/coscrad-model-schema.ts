// Do we really want to default to any?

import { CoscradPropertyTypeDefinition } from './coscrad-property-type-definition';

// eslint-disable-next-line
export type ICoscradModelSchema<T extends Record<string, unknown> = any> = {
    [K in keyof T]: CoscradPropertyTypeDefinition;
};
