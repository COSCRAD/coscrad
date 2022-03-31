import { isEntityId } from '../../types/EntityId';
import { EntityType, isEntityType } from '../../types/entityTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import { EntityId } from './EntityId';

/**
 * A `CompositeIdentifier` includes
 * - entity type
 * - entity id
 * We avoid calling this a `Composite Key`, as in Arango db, the convention
 * is to call the `entity id` `_key` and the `CompositeIdentifier` `_id`.
 */
export type EntityCompositeIdentifier<TEntityType = EntityType> = {
    type: TEntityType;
    id: EntityId;
};

export const isEntityCompositeIdentifier = (input: unknown): input is EntityCompositeIdentifier => {
    if (isNullOrUndefined(input)) return false;

    const { type, id } = input as EntityCompositeIdentifier;

    isEntityType(type) && isEntityId(id);
};
