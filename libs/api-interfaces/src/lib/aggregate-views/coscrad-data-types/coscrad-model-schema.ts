// Do we really want to default to any?

import { CoscradPropertyTypeDefinition } from './coscrad-property-type-definition';

export type ICoscradModelSchema<
    // eslint-disable-next-line
    T extends Record<string, unknown> = any,
    UDataTypes extends string = string
> = {
    [K in keyof T]: CoscradPropertyTypeDefinition<UDataTypes>;
};
