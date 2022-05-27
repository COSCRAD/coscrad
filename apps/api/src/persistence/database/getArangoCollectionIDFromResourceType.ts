import { isResourceType, ResourceType } from '../../domain/types/resourceTypes';
import { ArangoResourceCollectionID } from './types/ArangoCollectionId';

const resourceTypeToArangoCollectionID: {
    [k in ResourceType]: ArangoResourceCollectionID;
} = {
    term: 'terms',
    vocabularyList: 'vocabulary_lists',
    transcribedAudio: 'transcribed_audio',
    book: 'books',
    photograph: 'photographs',
    spatialFeature: 'spatial_features',
    bibliographicReference: 'bibliographic_references',
    song: 'songs',
    mediaItem: 'media_items',
};

export const getArangoCollectionIDFromResourceType = (
    resourceType: ResourceType
): ArangoResourceCollectionID => {
    if (Object.keys(resourceTypeToArangoCollectionID).includes(resourceType)) {
        const result = resourceTypeToArangoCollectionID[resourceType];

        return result;
    }

    throw new Error(`Cannot identify collection ID for unsupported entity: ${resourceType}`);
};

export const getResourceTypeFromArangoCollectionID = (
    collectionID: ArangoResourceCollectionID
): ResourceType => {
    const searchResult = Object.entries(resourceTypeToArangoCollectionID).find(
        ([_, collectionNameInLookupTable]) => collectionNameInLookupTable === collectionID
    )?.[0];

    if (!isResourceType(searchResult)) {
        throw new Error(`Cannot identify collection ID for unsupported entity: ${collectionID}`);
    }

    return searchResult;
};
