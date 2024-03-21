import {
    isBoolean,
    isNull,
    isNullOrUndefined,
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

    // TODO What if we override with an empty object?

    Object.entries(overrides).forEach(([keyForThisProperty, overridesForThisProperty]) => {
        // Is this value a primitive type? Then we can do a shallow assign.
        if (
            [isNumber, isString, isNull, isUndefined, isBoolean].some((predicate) =>
                predicate(overridesForThisProperty)
            ) ||
            isNullOrUndefined(clone[keyForThisProperty])
        ) {
            Object.assign(clone, {
                [keyForThisProperty]: overridesForThisProperty,
            });

            return;
        }

        if (Array.isArray(overridesForThisProperty)) {
            Object.assign(clone, {
                [keyForThisProperty]: overridesForThisProperty,
            });

            return;
        }

        if (typeof overridesForThisProperty === 'function') {
            throw new InternalError(`Cloning instances is not supported.`);
        }

        /**
         * Since our override value is an object, we need to recurse.
         *
         * At this point, either the original value is `null` \ `undefined` (in case it is optional),
         * or it is an object.
         *
         * If it is null or undefined, we simply set the value.
         *
         * If it is an object, we recurse, overriding only the specified properties.
         */

        const originalValue = clone[keyForThisProperty];

        if (isNullOrUndefined(originalValue)) {
            clone[keyForThisProperty] = cloneToPlainObject(overridesForThisProperty);
        } else {
            clone[keyForThisProperty] = clonePlainObjectWithOverrides(
                originalValue,
                overridesForThisProperty
            );
        }
    });

    return clone;
};
