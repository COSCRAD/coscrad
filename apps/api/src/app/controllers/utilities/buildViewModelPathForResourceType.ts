import { ResourceType, resourceTypes } from 'apps/api/src/domain/types/resourceTypes';

// For irregular plural forms or forms that lead to awkward grammar
const exceptions: Partial<Record<ResourceType, string>> = {
    [resourceTypes.transcribedAudio]: 'transcribedAudioItems',
};

export default (resourceType: ResourceType): string =>
    exceptions[resourceType] || `${resourceType}s`;
