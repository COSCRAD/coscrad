import {
    isBoolean,
    isNull,
    isNumber,
    isString,
    isUndefined,
} from '@coscrad/validation-constraints';
import { DeepPartial } from '../../types/DeepPartial';
import { InternalError } from '../errors/InternalError';
import cloneToPlainObject from './cloneToPlainObject';

export const clonePlainObjectWithOverrides = <T extends object = object>(
    object: T,
    overrides: DeepPartial<T>
): T => {
    // First we deep-clone to avoid shared references with the original
    const clone = cloneToPlainObject(object);

    Object.entries(overrides).forEach(([key, value]) => {
        // Is this value a primitive type? Then we can do a shallow assign.
        if (
            [isNumber, isString, isNull, isUndefined, isBoolean].some((predicate) =>
                predicate(value)
            )
        ) {
            Object.assign(clone, {
                [key]: value,
            });

            return;
        }

        if (Array.isArray(value)) {
            Object.assign(clone, {
                [key]: value,
            });

            return;
        }

        if (typeof value === 'function') {
            throw new InternalError(`Cloning instances is not supported.`);
        }

        // We have a plain object overrides
        Object.entries(value).forEach(([overrideKey, overrideValue]) => {
            Object.assign(
                clone[overrideKey],
                clonePlainObjectWithOverrides(clone[overrideKey], overrideValue)
            );
        });
    });

    return clone;
};
