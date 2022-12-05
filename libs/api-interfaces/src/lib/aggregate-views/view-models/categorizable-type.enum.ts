import { ResourceType } from './resources/resource-type.enum';

export const CategorizableType = {
    ...ResourceType,
    note: 'note',
} as const;

export type CategorizableType = ResourceType | typeof CategorizableType.note;
