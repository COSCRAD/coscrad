import { useLoadableMediaItems } from '../../../store/slices/resources/media-items';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { MediaItemIndexPresenter } from './media-item-index.presenter';

export const MediaItemIndexContainer = (): JSX.Element => {
    const loadableMediaItems = useLoadableMediaItems();

    const Presenter = displayLoadableWithErrorsAndLoading(MediaItemIndexPresenter);

    return <Presenter {...loadableMediaItems} />;
};
