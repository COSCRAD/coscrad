import { CompositeIdentifier } from '@coscrad/api-interfaces';
import { getCoscradDataSchema, getReferencesForCoscradDataSchema } from '@coscrad/data-types';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { isDeepStrictEqual } from 'util';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { ReferenceTree } from './reference-tree';

export const buildReferenceTree = (
    Ctor: Object,
    // TODO remove this
    snapshot: DeluxeInMemoryStore,
    instance: Object
) => {
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

            if (!allValues.every((id): id is string => isNonEmptyString(id))) {
                throw new Error(`Encountered one or more invalid ids: ${allValues.join(',')}`);
            }

            return acc.concat(
                allValues.map((id) => ({
                    type,
                    id,
                }))
            );
        },
        []
    );

    return ReferenceTree.fromCompositeIdentifierList(allReferences);
};
