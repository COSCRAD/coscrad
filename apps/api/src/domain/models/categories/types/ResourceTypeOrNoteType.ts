import { isResourceType, ResourceType } from '../../../types/resourceTypes';

export const noteType = 'note';

export type NoteType = typeof noteType;

// TODO improve naming. What is the significance of this in the domain?
export type ResourceTypeOrNoteType = ResourceType | NoteType;

export const isResourceTypeOrNoteType = (input: unknown): input is ResourceTypeOrNoteType =>
    isResourceType(input) || input === noteType;
