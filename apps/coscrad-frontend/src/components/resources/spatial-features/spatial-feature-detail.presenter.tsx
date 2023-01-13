import { ICategorizableDetailQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { buildSpatialFeatureDetailPresenter } from './build-spatial-feature-detail-presenter';

export const SpatialFeatureDetailPresenter = (
    detailQueryResult: ICategorizableDetailQueryResult<ISpatialFeatureViewModel>
): JSX.Element => {
    const {
        geometry: { type: geometricFeatureType },
    } = detailQueryResult;

    const Presenter = buildSpatialFeatureDetailPresenter(geometricFeatureType);

    return <Presenter {...detailQueryResult} />;
};
