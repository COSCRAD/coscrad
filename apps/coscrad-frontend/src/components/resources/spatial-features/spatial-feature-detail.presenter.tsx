import { IDetailQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { buildSpatialFeatureDetailPresenter } from './build-spatial-feature-detail-presenter';

export const SpatialFeatureDetailPresenter = (
    detailQueryResult: IDetailQueryResult<ISpatialFeatureViewModel>
): JSX.Element => {
    if (!detailQueryResult?.data?.geometry) {
        throw new Error(
            `geometry not specified on spatial feature detail result:${JSON.stringify(
                detailQueryResult
            )}`
        );
    }

    const {
        data: {
            geometry: { type: spatialFeatureGeometryType },
        },
    } = detailQueryResult;

    const Presenter = buildSpatialFeatureDetailPresenter(spatialFeatureGeometryType);

    return <Presenter {...detailQueryResult} />;
};
