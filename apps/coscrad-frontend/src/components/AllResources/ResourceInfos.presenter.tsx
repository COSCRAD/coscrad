import { IAggregateInfo, ResourceType } from '@coscrad/api-interfaces';
import { Divider } from '@mui/material';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { HasData } from '../higher-order-components';
import { ResourceInfoPresenter } from './ResourceInfoPresenter';

/**
 * Note the plural in the name. This presents all of the resource infos. It
 * maps through the singular `ResourceInfoPresenter` to do so.
 */
export const ResourceInfosPresenter: FunctionalComponent<
    HasData<IAggregateInfo<ResourceType>[]>
> = ({ data: resourceInfos }: HasData<IAggregateInfo<ResourceType>[]>) => (
    <div>
        <h2>Available Resources</h2>
        <Divider />
        <br />
        <br />
        {resourceInfos.map((info) => (
            <ResourceInfoPresenter {...info} key={info.type}></ResourceInfoPresenter>
        ))}
    </div>
);
