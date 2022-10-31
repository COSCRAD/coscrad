// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries
import { CoscradDataType, ICoscradModelSchema } from '@coscrad/api-interfaces';

// eslint-disable-next-line
export type ClassSchema<T extends Record<string, unknown> = any> = ICoscradModelSchema<
    T,
    CoscradDataType
>;
