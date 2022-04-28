const arangoResourceCollectionIDs = [
    'terms',
    'vocabulary_lists',
    'transcribed_audio',
    'books',
    'photographs',
    'spatial_features',
    'tags',
] as const;

export const arangoEdgeCollectionID = 'resource_edge_connections';

const arangoCollectionIDs = [...arangoResourceCollectionIDs, arangoEdgeCollectionID] as const;

export type ArangoResourceCollectionID = typeof arangoResourceCollectionIDs[number];

export const isArangoResourceCollectionID = (input: unknown): input is ArangoResourceCollectionID =>
    arangoResourceCollectionIDs.includes(input as ArangoResourceCollectionID);

export const getAllArangoResourceCollectionIDs = (): ArangoResourceCollectionID[] => [
    ...arangoResourceCollectionIDs,
];

export type ArangoCollectionID = typeof arangoCollectionIDs[number];

export const getAllArangoCollectionIDs = (): ArangoCollectionID[] => [...arangoCollectionIDs];
