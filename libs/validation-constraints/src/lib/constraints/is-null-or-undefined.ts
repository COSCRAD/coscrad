import { isNull } from './is-null';
import { isUndefined } from './is-undefined';

export const isNullOrUndefined = (input: unknown): input is null | undefined =>
    isNull(input) || isUndefined(input);
