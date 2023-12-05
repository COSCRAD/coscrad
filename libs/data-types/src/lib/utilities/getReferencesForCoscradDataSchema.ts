import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ClassSchema } from '../types';

export interface ReferenceSpecification {
    type: string;
    path: string;
    isArray: boolean;
}

/**
 * TODO We need to recurse and support nested references.
 */
export const getReferencesForCoscradDataSchema = (schema: ClassSchema<Record<string, unknown>>) =>
    Object.entries(schema).reduce(
        (acc: ReferenceSpecification[], [propertyKey, typeDefinition]) => {
            // @ts-expect-error TODO We need to improve type safety of @coscrad/data-types
            const { referenceTo, isArray } = typeDefinition;

            if (!isNullOrUndefined(referenceTo))
                return acc.concat([
                    {
                        type: referenceTo,
                        path: propertyKey,
                        isArray,
                    },
                ]);

            return acc;
        },
        []
    );
