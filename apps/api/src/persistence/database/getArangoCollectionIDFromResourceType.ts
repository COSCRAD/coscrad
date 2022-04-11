import { ResourceType } from '../../domain/types/resourceTypes';
import { ArangoCollectionID } from './types/ArangoCollectionId';

const resourceTypeToArangoCollectionID: {
    [k in ResourceType]: ArangoCollectionID;
} = {
    term: 'terms',
    vocabularyList: 'vocabulary_lists',
    transcribedAudio: 'transcribed_audio',
    book: 'books',
    photograph: 'photographs',
    spatialFeature: 'spatial_features',
    tag: 'tags',
};

export const getArangoCollectionIDFromResourceType = (
    resourceType: ResourceType
): ArangoCollectionID => {
    if (Object.keys(resourceTypeToArangoCollectionID).includes(resourceType)) {
        const result = resourceTypeToArangoCollectionID[resourceType];

        return result;
    }

    throw new Error(`Cannot identify collection ID for unsupported entity: ${resourceType}`);
};
