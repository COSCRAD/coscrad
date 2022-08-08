import DisallowedContextTypeForResourceError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
import getValidEntityInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { ResourceType, ResourceTypeToResourceModel } from '../../../types/ResourceType';
import isContextAllowedForGivenResourceType from '../../allowedContexts/isContextAllowedForGivenResourceType';
import { EdgeConnectionContextType } from '../../context/types/EdgeConnectionContextType';
import { ResourceModelContextStateValidatorInvalidTestCase } from '../resourceModelContextStateValidators.spec';
import getValidContextOfTypeForTest from './getValidContextOfTypeForTest';

export default <TResourceType extends ResourceType = ResourceType>(
    resourceType: TResourceType
): ResourceModelContextStateValidatorInvalidTestCase<
    ResourceTypeToResourceModel[TResourceType]
>[] => {
    const resource = getValidEntityInstanceForTest(resourceType);

    const result = Object.values(EdgeConnectionContextType)
        .filter((contextType) => !isContextAllowedForGivenResourceType(contextType, resourceType))
        .map((contextType) => ({
            contextType,
        }))
        .map(({ contextType }) => {
            const expectedError = new DisallowedContextTypeForResourceError(
                contextType,
                resource.getCompositeIdentifier()
            );

            const testCase = {
                description: `when a ${resourceType} receives a context with disallowed type: ${contextType}`,
                context: getValidContextOfTypeForTest(contextType),
                resource,
                expectedError,
            };

            return testCase;
        });

    return result;
};
