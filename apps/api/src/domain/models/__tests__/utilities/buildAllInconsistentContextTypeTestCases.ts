import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import DisallowedContextTypeForResourceError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/DisallowedContextTypeForResourceError';
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
    const resource = getValidAggregateInstanceForTest(resourceType);

    const result = Object.values(EdgeConnectionContextType)
        .filter(
            (conextType) =>
                ![
                    EdgeConnectionContextType.freeMultiline,
                    EdgeConnectionContextType.point2D,
                ].includes(conextType)
        )
        .filter((contextType) => !isContextAllowedForGivenResourceType(contextType, resourceType))
        .map((contextType) => {
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
