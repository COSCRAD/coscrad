import { useLoadableMediaItemById } from '../../../store/slices/resources/media-items';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { MediaItemDetailPresenter } from './media-item-detail.presenter';

export const MediaItemDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableMediaItemById}
        DetailPresenter={MediaItemDetailPresenter}
    />
);
