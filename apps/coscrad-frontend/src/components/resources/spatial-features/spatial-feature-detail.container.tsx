import { useLoadableSpatialFeatureById } from '../../../store/slices/resources';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { SpatialFeatureDetailPresenter } from './spatial-feature-detail.presenter';

export const SpatialFeatureDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableSpatialFeatureById}
        DetailPresenter={SpatialFeatureDetailPresenter}
    />
);
