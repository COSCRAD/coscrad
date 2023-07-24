import { isBoolean } from './is-boolean';
import { isNull } from './is-null';
import { isNumber } from './is-number';
import { isString } from './is-string';
import { isUndefined } from './is-undefined';

type PrimitiveType = null | undefined | string | number | boolean;

export const isPrimitiveType = (input: unknown): input is PrimitiveType =>
    [isNull, isUndefined, isString, isBoolean, isNumber].some((predicate) => predicate(input));
