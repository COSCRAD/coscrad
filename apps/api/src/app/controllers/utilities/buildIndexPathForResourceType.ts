import { ResourceType } from '../../../domain/types/ResourceType';
import { RESOURCES_ROUTE_PREFIX } from '../resources/constants';

// For irregular plural forms or forms that lead to awkward grammar
const exceptions: Partial<Record<ResourceType, string>> = {
    // We could default this to `audioItems` now but need to update the front-end and snapshots in contract tests
    [ResourceType.audioItem]: 'transcribedAudioItems',
};

// `${baseResourcesPath}/${buildViewModelPathForResourceType(resourceType)}`

const pluralizeResourceTypeInCamelCase = (resourceType: ResourceType): string =>
    exceptions[resourceType] || `${resourceType}s`;

export default (resourceType: ResourceType): string =>
    `${RESOURCES_ROUTE_PREFIX}/${pluralizeResourceTypeInCamelCase(resourceType)}`;
