import { isEnum } from '@coscrad/validation';
// TODO Perhaps we don't want the enums in this lib
// eslint-disable-next-line
import { CoscradUserRole } from '@coscrad/api-interfaces';

export { CoscradUserRole };

export const isCoscardUserRole = (input: unknown): input is CoscradUserRole =>
    isEnum(input, CoscradUserRole);
