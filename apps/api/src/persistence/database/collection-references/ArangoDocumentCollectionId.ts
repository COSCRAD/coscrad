import { ValueType } from '../../../lib/types/valueType';
import { ArangoResourceCollectionId } from './ArangoResourceCollectionId';

const NonResourceCollectionId = {
    tags: 'tags',
    categories: 'categories',
} as const;

/**
 * These are all the ordinary document collection IDs. For the edge collection
 * IDs, see `ArangoEdgeCollectionId`.
 */
export const ArangoDocumentCollectionId = {
    ...ArangoResourceCollectionId,
    ...NonResourceCollectionId,
};

/**
 * We are stacking this type with the above value definition because there doesn't
 * seem to be a more natural way to compose enums in TypeScript at present.
 */
export type ArangoDocumentCollectionId =
    | ValueType<typeof ArangoResourceCollectionId>
    | ValueType<typeof NonResourceCollectionId>;

export const getAllArangoDocumentCollectionIDs = (): ArangoDocumentCollectionId[] =>
    Object.values(ArangoDocumentCollectionId);
