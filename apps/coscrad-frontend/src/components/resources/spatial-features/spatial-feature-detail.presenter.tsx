import { IDetailQueryResult, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { CoscradLeafletMap } from './leaflet';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';
import { identifyCentrePointForMap } from './utils';

export const SpatialFeatureDetailPresenter = (
    // We really need to manage coordinate types somewhere central!
    detailQueryResult: IDetailQueryResult<
        ISpatialFeatureViewModel<[number, number] | [number, number][] | [number, number][][]>
    >
): JSX.Element => {
    if (!detailQueryResult?.data?.geometry) {
        throw new Error(
            `geometry not specified on spatial feature detail result:${JSON.stringify(
                detailQueryResult
            )}`
        );
    }

    const { data: spatialFeature } = detailQueryResult;

    const {
        geometry: { coordinates },
    } = spatialFeature;

    return (
        <CoscradLeafletMap
            spatialFeatures={[spatialFeature]}
            DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
            initialCentre={identifyCentrePointForMap(coordinates)}
        />
    );
};
