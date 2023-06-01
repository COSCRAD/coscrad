import { useLoadableResourceInfoWithConfigOverrides } from '../../store/slices/resources/resource-info/hooks';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { ResourceInfosPresenter } from './presenters';

export function ResourceInfoContainer(): JSX.Element {
    const loadableResourceInfos = useLoadableResourceInfoWithConfigOverrides();

    const LoadableResourceInfoPresenter = displayLoadableWithErrorsAndLoading(
        ResourceInfosPresenter,
        (data) => ({
            data,
        })
    );

    return <LoadableResourceInfoPresenter {...loadableResourceInfos} />;
}
