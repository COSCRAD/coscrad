import { IAggregateInfo, isResourceType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { useContext } from 'react';
import { RootState } from '../../..';
import { routes } from '../../../../app/routes/routes';
import { ConfigurableContentContext } from '../../../../configurable-front-matter/configurable-content-provider';
import { useLoadable } from '../shared/hooks';
import { fetchResourceInfos, RESOURCE_INFO } from './resource-info-slice';

type ResourceInfoMap = Map<ResourceType, Omit<IAggregateInfo, 'type'>>;

export const useLoadableResourceInfoWithConfigOverrides = () => {
    const { indexToDetailFlows } = useContext(ConfigurableContentContext);

    const selector = (state: RootState) => {
        const loadableResourceInfo = state[RESOURCE_INFO];

        if (loadableResourceInfo.data === null) return loadableResourceInfo;

        const { data: resourceInfosFromServer } = loadableResourceInfo;

        const defaultInfoMap: ResourceInfoMap = resourceInfosFromServer.reduce(
            (acc, resourceInfo) => acc.set(resourceInfo.type, resourceInfo),
            new Map() as ResourceInfoMap
        );

        const resourceInfoWithOverridesFromConfig: IAggregateInfo[] = indexToDetailFlows
            // exclude notes from resource big index
            .filter(({ categorizableType }) => isResourceType(categorizableType))
            .map(({ labelOverrides, categorizableType }) => {
                const label = isNullOrUndefined(labelOverrides) ? null : labelOverrides.label;

                const pluralLabel = isNullOrUndefined(labelOverrides)
                    ? null
                    : labelOverrides.pluralLabel;

                const route = isNullOrUndefined(labelOverrides) ? null : labelOverrides.route;

                const defaultInfoForThisCategorizable = defaultInfoMap.get(
                    categorizableType as ResourceType
                );

                return {
                    label: label || defaultInfoForThisCategorizable.label,
                    pluralLabel: pluralLabel || defaultInfoForThisCategorizable.pluralLabel,
                    route: route || defaultInfoForThisCategorizable.description,
                    type: categorizableType,
                    description: defaultInfoForThisCategorizable.description,
                    schema: defaultInfoForThisCategorizable.schema,
                    link: route || routes.resources.ofType(categorizableType as ResourceType).index,
                };
            });

        return { data: resourceInfoWithOverridesFromConfig, isLoading: false, errorInfo: null };
    };

    return useLoadable({
        selector,
        fetchThunk: fetchResourceInfos,
    });
};
