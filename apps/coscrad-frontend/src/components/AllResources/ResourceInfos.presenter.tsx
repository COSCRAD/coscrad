import { IAggregateInfo } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../utils/types/functional-component';
import { HasData } from '../higher-order-components';
import { ResourceInfoPresenter } from './ResourceInfoPresenter';

/**
 * Note the plural in the name. This presents all of the resource infos. It
 * maps through the singular `ResourceInfoPresenter` to do so.
 */
export const ResourceInfosPresenter: FunctionalComponent<HasData<IAggregateInfo[]>> = ({
    data: resourceInfos,
}: HasData<IAggregateInfo[]>) => (
    <div>
        <h2>Available Resources</h2>
        <div>
            {resourceInfos.map((info) => (
                <ResourceInfoPresenter {...info} key={info.type}></ResourceInfoPresenter>
            ))}
        </div>
    </div>
);
