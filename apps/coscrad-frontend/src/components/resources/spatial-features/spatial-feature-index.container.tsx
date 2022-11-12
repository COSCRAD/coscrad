import { useLoadableSpatialFeatures } from '../../../store/slices/resources';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { SpatialFeatureIndexPresenter } from './spatial-feature-index.presenter';

export const SpatialFeatureIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableSpatialFeatures}
        IndexPresenter={SpatialFeatureIndexPresenter}
    />
);
