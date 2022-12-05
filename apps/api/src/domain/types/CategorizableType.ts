import { CategorizableType } from '@coscrad/api-interfaces';

export { CategorizableType };

export const isCategorizableType = (input: unknown): input is CategorizableType =>
    Object.values(CategorizableType).some((type) => type === input);
