const arangoCollectionIDs = [
    'terms',
    'vocabulary_lists',
    'transcribed_audio',
    'books',
    'photographs',
    'spatial_features',
    'tags',
] as const;

export type ArangoCollectionID = typeof arangoCollectionIDs[number];

export const getAllArangoCollectionIDs = (): ArangoCollectionID[] => [...arangoCollectionIDs];
