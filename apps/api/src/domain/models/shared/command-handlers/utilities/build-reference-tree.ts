import { CompositeIdentifier } from '@coscrad/api-interfaces';
import { getCoscradDataSchema, getReferencesForCoscradDataSchema } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { getDeepPropertyFromObject } from '../../../../../lib/utilities/getDeepPropertyFromObject';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { ReferenceTree } from './reference-tree';

export const buildReferenceTree = (Ctor: Object, instance: Object) => {
    const referenceSpecifications = getReferencesForCoscradDataSchema(getCoscradDataSchema(Ctor));

    // for every reference property, get the references from the instance
    const allReferences = referenceSpecifications.reduce(
        (acc: CompositeIdentifier<string>[], { type, path, isArray, isOptional }) => {
            let value: unknown;

            if (path.includes('.')) {
                value = getDeepPropertyFromObject(instance, path);
            } else {
                value = instance[path];
            }

            if (isOptional && isNullOrUndefined(value)) {
                // an optional referential property was omitted
                return acc;
            }

            if (isOptional && Array.isArray(value)) {
                // remove optionally omitted values
                value = value.flatMap((element) =>
                    (Array.isArray(element) ? element : [element]).filter(
                        (nestedElement) => !isNullOrUndefined(nestedElement)
                    )
                );
            }

            if (isArray && !Array.isArray(value)) {
                throw new Error(`Expected an array but encountered: ${value}`);
            }

            // There is no reference to add here
            if (isNullOrUndefined(value) || (isArray && isDeepStrictEqual(value, []))) return acc;

            let allValues =
                isArray || Array.isArray(value)
                    ? (value as CompositeIdentifier<string>[])
                    : [value];

            if (isOptional) {
                allValues = allValues.filter((v) => !isNullOrUndefined(v));
            }

            // this is getting very complex. we need to deal with this
            if (allValues.every((v): v is string[] => Array.isArray(v))) {
                allValues = allValues.flatMap((v) => v);
            }

            if (allValues.every((id): id is string => isNonEmptyString(id))) {
                return acc.concat(
                    allValues
                        .filter((id) => !isNullOrUndefined(id))
                        .map((id) => ({
                            type,
                            id,
                        }))
                );
            }

            if (
                allValues.every((v: unknown) => {
                    if (isNullOrUndefined(v)) return false;

                    const { type, id } = v as CompositeIdentifier<string>;

                    return isNonEmptyString(type) && isNonEmptyString(id);
                })
            ) {
                // @ts-expect-error fix types
                return acc.concat(allValues);
            }

            throw new Error(`Encountered one or more invalid ids: ${allValues.join(',')}`);
        },
        []
    );

    return ReferenceTree.fromCompositeIdentifierList(allReferences);
};
