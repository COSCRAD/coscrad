import { RootState } from '../../store';
import { fetchResourceInfos } from '../../store/slices/resourceInfoSlice';
import { useLoadable } from '../../utils/custom-hooks/useLoadable';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { ResourceInfosPresenter } from './ResourceInfos.presenter';

export function AllResources(): JSX.Element {
    const [loadableResourceInfos] = useLoadable({
        selector: (state: RootState) => state.resourceInfo,
        fetchThunk: fetchResourceInfos,
    });

    const LoadableResourceInfoPresenter = displayLoadableWithErrorsAndLoading(
        ResourceInfosPresenter,
        wrapArrayProps
    );

    return <LoadableResourceInfoPresenter {...loadableResourceInfos} />;
}
