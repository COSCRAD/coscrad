const arangoCollectionIDs = [
    'terms',
    'vocabulary_lists',
    'audio_with_transcript',
    'books',
    'tags',
] as const;

export type ArangoCollectionID = typeof arangoCollectionIDs[number];

export const getAllArangoCollectionIDs = (): ArangoCollectionID[] => [...arangoCollectionIDs];
