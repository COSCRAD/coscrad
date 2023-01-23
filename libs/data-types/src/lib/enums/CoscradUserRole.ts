// TODO Perhaps we don't want the enums in this lib
// eslint-disable-next-line
import { CoscradUserRole } from '@coscrad/api-interfaces';

export { CoscradUserRole };

export const isCoscardUserRole = (input: unknown): input is CoscradUserRole =>
    Object.values(CoscradUserRole).some((role) => role === input);
