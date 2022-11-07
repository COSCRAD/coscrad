import { useLoadableSpatialFeatureById } from '../../../store/slices/resources';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { SpatialFeatureDetailPresenter } from './spatial-feature-detail.presenter';

export const SpatialFeatureDetailContainer = (): JSX.Element => {
    const loadableSearchResult = useLoadableSpatialFeatureById();

    const Presenter = displayLoadableSearchResult(SpatialFeatureDetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
