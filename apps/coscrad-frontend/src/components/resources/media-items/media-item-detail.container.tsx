import { useLoadableMediaItemById } from '../../../store/slices/resources/media-items';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { MediaItemDetailPresenter } from './media-item-detail.presenter';

export const MediaItemDetailContainer = (): JSX.Element => {
    const loadableMediaItem = useLoadableMediaItemById();

    const Presenter = displayLoadableSearchResult(MediaItemDetailPresenter);

    return <Presenter {...loadableMediaItem} />;
};
