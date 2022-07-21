import { ResourceType } from './ResourceType';

export const CategorizableType = {
    ...ResourceType,
    note: 'note',
};

export type CategorizableType = ResourceType | typeof CategorizableType.note;

export const isCategorizableType = (input: unknown): input is CategorizableType =>
    Object.values(CategorizableType).some((type) => type === input);
