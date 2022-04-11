import { isResourceId, ResourceId } from '../../types/ResourceId';
import { isResourceType, ResourceType } from '../../types/resourceTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';

/**
 * A `CompositeIdentifier` includes
 * - resource type
 * - resource id
 * We avoid calling this a `Composite Key`, as in Arango db, the convention
 * is to call the `document id` `_key` and the `CompositeIdentifier` `_id`.
 */
export type ResourceCompositeIdentifier<TResourceType = ResourceType> = {
    type: TResourceType;
    id: ResourceId;
};

export const isResourceCompositeIdentifier = (
    input: unknown
): input is ResourceCompositeIdentifier => {
    if (isNullOrUndefined(input)) return false;

    const { type, id } = input as ResourceCompositeIdentifier;

    isResourceType(type) && isResourceId(id);
};
