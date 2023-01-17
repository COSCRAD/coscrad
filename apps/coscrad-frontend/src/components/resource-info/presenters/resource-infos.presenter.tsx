import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Stack } from '@mui/material';
import { DividerStyle } from '../../../styled-components';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { HasData } from '../../higher-order-components';
import { ResourceInfoPresenter } from './resource-info.presenter';

/**
 * Note the plural in the name. This presents all of the resource infos. It
 * maps through the singular `ResourceInfoPresenter` to do so.
 */
export const ResourceInfosPresenter: FunctionalComponent<
    HasData<IAggregateInfo<ResourceType>[]>
> = ({ data: resourceInfos }: HasData<IAggregateInfo<ResourceType>[]>) => (
    <div>
        <h2>Available Resources</h2>
        <DividerStyle />
        <Stack spacing={1}>
            {resourceInfos.map((info) => (
                <ResourceInfoPresenter {...info} key={info.type}></ResourceInfoPresenter>
            ))}
        </Stack>
    </div>
);
