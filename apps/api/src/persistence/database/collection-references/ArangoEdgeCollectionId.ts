import { ValueType } from '../../../lib/types/valueType';

export const ArangoEdgeCollectionId = {
    categoryEdgeCollectionID: 'category_edges',
    edgeConnectionCollectionID: 'resource_edge_connections',
} as const;

export type ArangoEdgeCollectionId = ValueType<typeof ArangoEdgeCollectionId>;

export const isArangoEdgeCollectionCollectionID = (
    input: unknown
): input is ArangoEdgeCollectionId =>
    Object.values(ArangoEdgeCollectionId).includes(input as ArangoEdgeCollectionId);

export const getAllArangoEdgeCollectionIDs = (): ArangoEdgeCollectionId[] =>
    Object.values(ArangoEdgeCollectionId);
