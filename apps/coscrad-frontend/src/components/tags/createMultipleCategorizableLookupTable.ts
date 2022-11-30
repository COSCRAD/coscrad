import { CategorizableCompositeIdentifier } from '@coscrad/api-interfaces';
import { CategorizableTypeAndSelectedIds } from '../higher-order-components';

export const createMultipleCategorizableLookupTable = (
    members: CategorizableCompositeIdentifier[]
): CategorizableTypeAndSelectedIds => {
    const allResourceTypesWithRepeats = members.flatMap(({ type }) => type);

    const uniqueResourceTypesWithThisTag = [...new Set(allResourceTypesWithRepeats)];

    const initialEmptyReosurceTypesAndSelectedIds = uniqueResourceTypesWithThisTag.reduce(
        (acc, resourceType) => ({
            ...acc,
            [resourceType]: [],
        }),
        {}
    );

    // A Map might improve readability here
    return members.reduce(
        (acc, { type: resourceType, id }) => ({
            ...acc,
            [resourceType]: acc[resourceType].concat(id),
        }),
        initialEmptyReosurceTypesAndSelectedIds
    );
};
