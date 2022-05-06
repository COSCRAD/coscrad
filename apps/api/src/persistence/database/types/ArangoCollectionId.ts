/**
 * TODO [https://www.pivotaltracker.com/story/show/182132515]
 * Refactor. Reorganize our collection name \ type management.
 */
const arangoResourceCollectionIDs = [
    'terms',
    'vocabulary_lists',
    'transcribed_audio',
    'books',
    'photographs',
    'spatial_features',
    'bibliographic_references',
    'songs',
] as const;

export const categoryEdgeCollectionID = 'category_edges';

export const edgeConnectionCollectionID = 'resource_edge_connections';

export const arangoEdgeCollectionIDs = [
    categoryEdgeCollectionID,
    edgeConnectionCollectionID,
] as const;

export type ArangoEdgeCollectionID = typeof arangoEdgeCollectionIDs[number];

export const isArangoEdgeCollectionCollectionID = (
    input: unknown
): input is ArangoEdgeCollectionID =>
    arangoEdgeCollectionIDs.includes(input as ArangoEdgeCollectionID);

export const tagCollectionID = 'tags';

export const categoryCollectionID = 'categories';

const arangoCollectionIDs = [
    ...arangoResourceCollectionIDs,
    ...arangoEdgeCollectionIDs,
    tagCollectionID,
    categoryCollectionID,
] as const;

export type ArangoResourceCollectionID = typeof arangoResourceCollectionIDs[number];

export const isArangoResourceCollectionID = (input: unknown): input is ArangoResourceCollectionID =>
    arangoResourceCollectionIDs.includes(input as ArangoResourceCollectionID);

export const getAllArangoResourceCollectionIDs = (): ArangoResourceCollectionID[] => [
    ...arangoResourceCollectionIDs,
];

export type ArangoCollectionID = typeof arangoCollectionIDs[number];

export const getAllArangoCollectionIDs = (): ArangoCollectionID[] => [...arangoCollectionIDs];

export const isArangoCollectionID = (input: unknown): input is ArangoCollectionID =>
    arangoCollectionIDs.includes(input as ArangoCollectionID);
