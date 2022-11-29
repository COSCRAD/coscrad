import { GeometricFeatureType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { LinePresenter } from './line-presenter';
import { PointPresenter } from './point-presenter';
import { PolygonPresenter } from './polygon-presenter';

interface HasCoordinates<T = unknown> {
    coordinates: T;
}

const lookupTable: { [K in GeometricFeatureType]: FunctionalComponent<HasCoordinates> } = {
    [GeometricFeatureType.point]: PointPresenter,
    [GeometricFeatureType.line]: LinePresenter,
    [GeometricFeatureType.polygon]: PolygonPresenter,
};

export const SpatialFeatureDetailThumbnailPresenter = (
    spatialFeature: ISpatialFeatureViewModel
): JSX.Element => {
    const {
        geometry: { type: geometryType, coordinates },
    } = spatialFeature;

    const CoordinatesPresenter = lookupTable[geometryType];

    if (CoordinatesPresenter === null || typeof CoordinatesPresenter === 'undefined') {
        throw new Error(
            `There is no thumbnail presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    /**
     * TODO Wrap additional non-coordinate presentation around this.
     */
    return <CoordinatesPresenter coordinates={coordinates} />;
};
