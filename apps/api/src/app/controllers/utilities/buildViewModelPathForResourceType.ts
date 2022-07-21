import { ResourceType } from '../../../domain/types/ResourceType';

// For irregular plural forms or forms that lead to awkward grammar
const exceptions: Partial<Record<ResourceType, string>> = {
    [ResourceType.transcribedAudio]: 'transcribedAudioItems',
};

export default (resourceType: ResourceType): string =>
    exceptions[resourceType] || `${resourceType}s`;
