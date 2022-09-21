import { ResourceType } from '../../../domain/types/ResourceType';
import { RESOURCES_ROUTE_PREFIX } from '../resources/constants';

// For irregular plural forms or forms that lead to awkward grammar
const exceptions: Partial<Record<ResourceType, string>> = {
    [ResourceType.transcribedAudio]: 'transcribedAudioItems',
};

// `${baseResourcesPath}/${buildViewModelPathForResourceType(resourceType)}`

const pluralizeResourceTypeInCamelCase = (resourceType: ResourceType): string =>
    exceptions[resourceType] || `${resourceType}s`;

export default (resourceType: ResourceType): string =>
    `${RESOURCES_ROUTE_PREFIX}/${pluralizeResourceTypeInCamelCase(resourceType)}`;
