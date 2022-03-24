const arangoCollectionIDs = ['terms', 'vocabulary_lists', 'tags'] as const;

export type ArangoCollectionID = typeof arangoCollectionIDs[number];

export const getAllArangoCollectionIDs = (): ArangoCollectionID[] => [...arangoCollectionIDs];
