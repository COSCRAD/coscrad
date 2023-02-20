import { ResourceType } from '@coscrad/api-interfaces';

const lookupTable: { [K in ResourceType]: string } = {
    [ResourceType.bibliographicReference]: 'BibliographicReferences',
    [ResourceType.book]: 'Books',
    [ResourceType.mediaItem]: 'MediaItems',
    [ResourceType.photograph]: 'Photographs',
    [ResourceType.song]: 'Songs',
    [ResourceType.spatialFeature]: 'Map',
    [ResourceType.term]: 'Terms',
    [ResourceType.audioItem]: 'AudioItems',
    [ResourceType.video]: 'Videos',
    [ResourceType.vocabularyList]: 'VocabularyLists',
};

export const getResourceTypeLabelForRoutes = (resourceType: ResourceType) => {
    const lookupResult = lookupTable[resourceType];

    if (!lookupResult) {
        throw new Error(`Failed to find a route label for resource type: ${resourceType}`);
    }

    return lookupResult;
};
