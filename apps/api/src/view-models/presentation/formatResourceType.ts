import { isStringWithNonzeroLength } from '@coscrad/validation';
import { ResourceType } from '../../domain/types/ResourceType';
import { InternalError } from '../../lib/errors/InternalError';

type ResourceTypeAndLabel = {
    [K in ResourceType]: string;
};

const resourceTypeAndLabel: ResourceTypeAndLabel = {
    [ResourceType.bibliographicReference]: 'BibliographicReference',
    [ResourceType.book]: 'Book',
    [ResourceType.mediaItem]: 'Media Item',
    [ResourceType.photograph]: 'Photograph',
    [ResourceType.song]: 'Song',
    [ResourceType.spatialFeature]: 'Spatial Feature',
    [ResourceType.term]: 'Term',
    [ResourceType.transcribedAudio]: 'Transcribed Audio Model',
    [ResourceType.vocabularyList]: 'Vocabulary List',
};

export default (resourceType: ResourceType): string => {
    const label = resourceTypeAndLabel[resourceType];

    if (!isStringWithNonzeroLength(label)) {
        throw new InternalError(`Failed to find label for resource type: ${resourceType}`);
    }

    return label;
};
