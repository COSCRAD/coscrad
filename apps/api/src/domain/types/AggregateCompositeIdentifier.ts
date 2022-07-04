import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import { AggregateId, isAggregateId } from './AggregateId';
import { AggregateType, isAggregateType } from './AggregateType';

/**
 * A `CompositeIdentifier` includes
 * - aggregate type
 * - aggregate id
 * We avoid calling this a `Composite Key`, as in Arango db, the convention
 * is to call the `document id` `_key` and the `CompositeIdentifier` `_id`.
 */
export type AggregateCompositeIdentifier<TAggregateType = AggregateType> = {
    type: TAggregateType;
    id: AggregateId;
};

export const isAggregateCompositeIdentifier = (
    input: unknown
): input is AggregateCompositeIdentifier => {
    if (isNullOrUndefined(input)) return false;

    const { type, id } = input as AggregateCompositeIdentifier;

    return isAggregateType(type) && isAggregateId(id);
};
