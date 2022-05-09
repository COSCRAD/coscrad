import { EntityId, isResourceId } from '../../../types/ResourceId';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import { isResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { noteType, ResourceTypeOrNoteType } from './ResourceTypeOrNoteType';

// TODO build this and ResourceCompositeIdentifier from a common, more generic type
export type ResourceOrNoteCompositeIdentifier = {
    type: ResourceTypeOrNoteType;

    id: EntityId;
};

export const isResourceOrNoteCompositeIdentifier = (
    input: unknown
): input is ResourceOrNoteCompositeIdentifier => {
    if (isResourceCompositeIdentifier(input)) return true;

    if (isNullOrUndefined(input)) return false;

    const { type, id } = input as ResourceOrNoteCompositeIdentifier;

    return isResourceId(id) && type === noteType;
};
