import {
    ResourceType,
    ResourceTypeToResourceModel,
} from '../../../../../domain/types/ResourceType';
import { isNullOrUndefined } from '../../../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { aggregateTypeToViewModelCtor } from './aggregateTypeToViewModelCtor';

export const getViewModelCtorFromResourceType = <T extends ResourceType>(
    resourceType: T
): ResourceTypeToResourceModel[T] => {
    const lookupResult = aggregateTypeToViewModelCtor[resourceType];

    if (isNullOrUndefined(lookupResult)) {
        throw new InternalError(
            `Failed to find a view model constructor for resource type: ${resourceType}`
        );
    }

    return lookupResult as unknown as ResourceTypeToResourceModel[T];
};
