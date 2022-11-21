import {
    HttpStatusCode,
    IBaseViewModel,
    IHttpErrorInfo,
    ResourceType,
} from '@coscrad/api-interfaces';
import { useSelector } from 'react-redux';
import { ILoadable } from '../../../interfaces/loadable.interface';
import { createResourceSelector } from '../selectors/create-resource-selector';

type ResourceMap = Map<ResourceType, IBaseViewModel[]>;

export const useLoadableResourcesMap = (): ILoadable<ResourceMap> => {
    const resourceSelector = createResourceSelector();

    const loadableResources = useSelector(resourceSelector);

    const isLoading = Object.values(loadableResources).some(({ isLoading }) => isLoading);

    const allErrorInfos = Object.values(loadableResources).reduce(
        (accErrorInfos: IHttpErrorInfo[], { errorInfo }) =>
            errorInfo ? accErrorInfos.concat(errorInfo) : accErrorInfos,
        []
    );

    const compoundErrorInfo: IHttpErrorInfo =
        allErrorInfos.length > 0
            ? {
                  code: HttpStatusCode.internalError,
                  message: `Inner Errors: \n${allErrorInfos
                      .map(({ message }) => message)
                      .join('\n')}`,
              }
            : null;

    if (isLoading || compoundErrorInfo)
        return {
            isLoading,
            errorInfo: compoundErrorInfo,
            // should we buble up what data we have so far?
            data: null,
        };

    const map = Object.values(ResourceType).reduce(
        (accMap: Map<ResourceType, IBaseViewModel[]>, resourceType) =>
            accMap.set(
                resourceType,
                // We need some serious improvement in our naming here!
                loadableResources[resourceType].data.data.map(({ data }) => data)
            ),
        new Map()
    );

    return {
        isLoading: false,
        errorInfo: null,
        data: map,
    };
};
