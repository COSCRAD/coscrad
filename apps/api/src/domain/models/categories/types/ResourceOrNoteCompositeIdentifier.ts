import { ICompositeIdentifier } from '@coscrad/api-interfaces';
import { isAggregateId } from '../../../types/AggregateId';
import { CategorizableType, isCategorizableType } from '../../../types/CategorizableType';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';

// Do we really want to break this out from here?
export type CategorizableCompositeIdentifier = ICompositeIdentifier<CategorizableType>;

export const isResourceOrNoteCompositeIdentifier = (
    input: unknown
): input is CategorizableCompositeIdentifier => {
    if (isNullOrUndefined(input)) return false;

    const { id, type } = input as CategorizableCompositeIdentifier;

    return isAggregateId(id) && isCategorizableType(type);
};
