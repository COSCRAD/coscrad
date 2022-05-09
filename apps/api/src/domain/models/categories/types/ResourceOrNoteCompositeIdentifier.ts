import { EntityId } from '../../../types/ResourceId';
import { ResourceTypeOrNoteType } from './ResourceTypeOrNoteType';

// TODO build this and ResourceCompositeIdentifier from a common, more generic type
export type ResourceOrNoteCompositeIdentifier = {
    type: ResourceTypeOrNoteType;

    id: EntityId;
};
