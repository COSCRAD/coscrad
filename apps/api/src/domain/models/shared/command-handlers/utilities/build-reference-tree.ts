import { CompositeIdentifier } from '@coscrad/api-interfaces';
import { getCoscradDataSchema, getReferencesForCoscradDataSchema } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { ReferenceTree } from './reference-tree';

export const buildReferenceTree = (Ctor: Object, instance: Object) => {
    const referenceSpecifications = getReferencesForCoscradDataSchema(getCoscradDataSchema(Ctor));

    // for every reference property, get the references from the instance
    const allReferences = referenceSpecifications.reduce(
        (acc: CompositeIdentifier<string>[], { type, path, isArray }) => {
            if (path.includes('.')) {
                throw new Error(`Nested References are not supported`);
            }

            const value = instance[path];

            if (isArray && !Array.isArray(value)) {
                throw new Error(`Expected an array but encountered: ${value}`);
            }

            // There is no reference to add here
            if (isNullOrUndefined(value) || (isArray && isDeepStrictEqual(value, []))) return acc;

            const allValues = isArray ? value : [value];

            if (allValues.every((id): id is string => isNonEmptyString(id))) {
                return acc.concat(
                    allValues.map((id) => ({
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
                return acc.concat(allValues);
            }

            throw new Error(`Encountered one or more invalid ids: ${allValues.join(',')}`);
        },
        []
    );

    return ReferenceTree.fromCompositeIdentifierList(allReferences);
};
