import { useLoadableMediaItems } from '../../../store/slices/resources/media-items';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { MediaItemIndexPresenter } from './media-item-index.presenter';

export const MediaItemIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableMediaItems}
        IndexPresenter={MediaItemIndexPresenter}
    />
);
