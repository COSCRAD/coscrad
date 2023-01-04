import { RootState } from '../../store';
import { fetchResourceInfos } from '../../store/slices/resource-info-slice';
import { useLoadable } from '../../store/slices/resources/shared/hooks';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { ResourceInfosPresenter } from './presenters';

export function ResourceInfoContainer(): JSX.Element {
    const loadableResourceInfos = useLoadable({
        selector: (state: RootState) => state.resourceInfo,
        fetchThunk: fetchResourceInfos,
    });

    const LoadableResourceInfoPresenter = displayLoadableWithErrorsAndLoading(
        ResourceInfosPresenter,
        wrapArrayProps
    );

    return <LoadableResourceInfoPresenter {...loadableResourceInfos} />;
}
