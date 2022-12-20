import {
    SpatialFeatureIndexState,
    useLoadableSpatialFeatures,
} from '../../../store/slices/resources';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { CoscradLeafletMap } from './leaflet';
import { SpatialFeatureIndexPresenter } from './spatial-feature-index.presenter';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';

const ConcreteSpatialFeatureIndexPresenter = (
    indexResult: SpatialFeatureIndexState
): JSX.Element => (
    <SpatialFeatureIndexPresenter
        {...indexResult}
        // TODO In the future, we can inject these based on a config
        MapComponent={CoscradLeafletMap}
        DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
    />
);

interface Props {
    SpatialFeatureIndexPresenter?: FunctionalComponent<SpatialFeatureIndexState>;
}

export const SpatialFeatureIndexContainer = ({
    SpatialFeatureIndexPresenter,
}: Props): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableSpatialFeatures}
        IndexPresenter={SpatialFeatureIndexPresenter || ConcreteSpatialFeatureIndexPresenter}
    />
);
