import { ValueType } from '../../../lib/types/valueType';
import { ArangoDocumentCollectionId } from './ArangoDocumentCollectionId';
import { ArangoEdgeCollectionId } from './ArangoEdgeCollectionId';

export const ArangoCollectionId = {
    ...ArangoDocumentCollectionId,
    ...ArangoEdgeCollectionId,
};

/**
 * We are stacking this type with the above value definition because there doesn't
 * seem to be a more natural way to compose enums in TypeScript at present.
 */
export type ArangoCollectionId = ValueType<typeof ArangoCollectionId>;

export const getAllArangoCollectionIDs = () => Object.values(ArangoCollectionId);

export const isArangoCollectionId = (input: unknown): input is ArangoCollectionId =>
    getAllArangoCollectionIDs().some((id) => id === input);
