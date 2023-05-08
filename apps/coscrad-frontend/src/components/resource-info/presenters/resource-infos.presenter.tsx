import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { HasData } from '../../higher-order-components';
import { ResourceInfoContainerProps } from '../resource-info.container';
import { ResourceInfoPresenter } from './resource-info.presenter';

type ResourceInfosPresenterProps = HasData<IAggregateInfo<ResourceType>[]> &
    ResourceInfoContainerProps;
/**
 * Note the plural in the name. This presents all of the resource infos. It
 * maps through the singular `ResourceInfoPresenter` to do so.
 */
export const ResourceInfosPresenter: FunctionalComponent<ResourceInfosPresenterProps> = ({
    data: resourceInfos,
    resourceTypesAndLabels,
    resourceTypesAndRoutes,
}: ResourceInfosPresenterProps) => (
    <>
        <Typography variant="h2">Available Resources</Typography>
        <Stack data-cy="resourceInfos-stack" spacing={1}>
            {resourceInfos
                .filter(({ type }) => Object.keys(resourceTypesAndLabels).includes(type))
                .map((info) => (
                    <ResourceInfoPresenter
                        {...info}
                        key={info.type}
                        label={resourceTypesAndLabels[info.type]}
                        route={resourceTypesAndRoutes[info.type]}
                    />
                ))}
        </Stack>
    </>
);
