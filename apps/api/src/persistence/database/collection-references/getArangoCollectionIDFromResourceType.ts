import { isResourceType, ResourceType } from '../../../domain/types/ResourceType';
import { ArangoResourceCollectionId } from './ArangoResourceCollectionId';

const resourceTypeToArangoCollectionID: {
    [k in ResourceType]: ArangoResourceCollectionId;
} = {
    [ResourceType.term]: ArangoResourceCollectionId.terms,
    [ResourceType.vocabularyList]: ArangoResourceCollectionId.vocabulary_lists,
    [ResourceType.transcribedAudio]: ArangoResourceCollectionId.transcribed_audio,
    [ResourceType.book]: ArangoResourceCollectionId.books,
    [ResourceType.photograph]: ArangoResourceCollectionId.photographs,
    [ResourceType.spatialFeature]: ArangoResourceCollectionId.spatial_features,
    [ResourceType.bibliographicReference]: ArangoResourceCollectionId.bibliographic_references,
    [ResourceType.song]: ArangoResourceCollectionId.songs,
    [ResourceType.mediaItem]: ArangoResourceCollectionId.media_items,
};

export const getArangoCollectionIDFromResourceType = (
    resourceType: ResourceType
): ArangoResourceCollectionId => {
    if (Object.keys(resourceTypeToArangoCollectionID).includes(resourceType)) {
        const result = resourceTypeToArangoCollectionID[resourceType];

        return result;
    }

    throw new Error(`Cannot identify collection ID for unsupported entity: ${resourceType}`);
};

export const getResourceTypeFromArangoCollectionID = (
    collectionID: ArangoResourceCollectionId
): ResourceType => {
    const searchResult = Object.entries(resourceTypeToArangoCollectionID).find(
        ([_, collectionNameInLookupTable]) => collectionNameInLookupTable === collectionID
    )?.[0];

    if (!isResourceType(searchResult)) {
        throw new Error(`Cannot identify collection ID for unsupported entity: ${collectionID}`);
    }

    return searchResult;
};
