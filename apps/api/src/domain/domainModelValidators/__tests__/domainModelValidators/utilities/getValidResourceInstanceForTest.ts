import buildTestData from '../../../../../test-data/buildTestData';
import { ResourceType, ResourceTypeToResourceModel } from '../../../../types/ResourceType';

export default <TResourceType extends ResourceType>(
    ResourceType: TResourceType
): ResourceTypeToResourceModel[TResourceType] =>
    buildTestData().resources[ResourceType][0] as ResourceTypeToResourceModel[TResourceType];
