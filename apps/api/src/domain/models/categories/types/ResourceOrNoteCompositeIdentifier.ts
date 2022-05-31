import { AggregateId, isAggregateId } from '../../../types/AggregateId';
import { CategorizableType, isCategorizableType } from '../../../types/CategorizableType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';

// TODO build this and ResourceCompositeIdentifier from a common, more generic type
export type CategorizableCompositeIdentifier = {
    type: CategorizableType;

    id: AggregateId;
};

export const isResourceOrNoteCompositeIdentifier = (
    input: unknown
): input is CategorizableCompositeIdentifier => {
    if (isNullOrUndefined(input)) return false;

    const { id, type } = input as CategorizableCompositeIdentifier;

    return isAggregateId(id) && isCategorizableType(type);
};
