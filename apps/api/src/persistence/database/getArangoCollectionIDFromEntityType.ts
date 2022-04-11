import { EntityType } from '../../domain/types/entityTypes';
import { ArangoCollectionID } from './types/ArangoCollectionId';

const entityTypeToArangoCollectionID: {
    [k in EntityType]: ArangoCollectionID;
} = {
    term: 'terms',
    vocabularyList: 'vocabulary_lists',
    transcribedAudio: 'transcribed_audio',
    book: 'books',
    photograph: 'photographs',
    spatialFeature: 'spatial_features',
    tag: 'tags',
};

export const getArangoCollectionIDFromEntityType = (entityType: EntityType): ArangoCollectionID => {
    if (Object.keys(entityTypeToArangoCollectionID).includes(entityType)) {
        const result = entityTypeToArangoCollectionID[entityType];

        return result;
    }

    throw new Error(`Cannot identify collection ID for unsupported entity: ${entityType}`);
};
