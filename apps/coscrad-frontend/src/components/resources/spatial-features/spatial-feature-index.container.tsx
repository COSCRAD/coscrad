import { useLoadableSpatialFeatures } from '../../../store/slices/resources';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { SpatialFeatureIndexPresenter } from './spatial-feature-index.presenter';

export const SpatialFeatureIndexContainer = (): JSX.Element => {
    const [loadableSpatialFeatures] = useLoadableSpatialFeatures();

    const Presenter = displayLoadableWithErrorsAndLoading(SpatialFeatureIndexPresenter);

    return <Presenter {...loadableSpatialFeatures} />;
};
