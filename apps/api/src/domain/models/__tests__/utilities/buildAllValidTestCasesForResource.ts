import { ResourceType, ResourceTypeToResourceModel } from '../../../types/ResourceType';
import { getAllowedContextsForModel } from '../../allowedContexts/isContextAllowedForGivenResourceType';
import { ResourceModelContextStateValidatorValidTestCase } from '../resourceModelContextStateValidators.spec';
import getValidResourceAndContextPairForTest from './getValidResourceAndContextPairForTest';

export default <TResourceType extends ResourceType = ResourceType>(
    resourceType: TResourceType
): ResourceModelContextStateValidatorValidTestCase<ResourceTypeToResourceModel[TResourceType]>[] =>
    getAllowedContextsForModel(resourceType).map((contextType) => {
        const [resource, context] = getValidResourceAndContextPairForTest(
            resourceType,
            contextType
        );

        return {
            description: `when a valid context of type: ${contextType} is applied to a resource of type: ${resourceType}`,
            resource,
            context,
        };
    });
