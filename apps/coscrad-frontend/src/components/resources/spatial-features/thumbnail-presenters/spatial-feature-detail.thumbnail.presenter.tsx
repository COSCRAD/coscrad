import {
    GeometricFeatureType,
    IDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { Card, CardContent, CardHeader, Divider } from '@mui/material';
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

export const SpatialFeatureDetailThumbnailPresenter = ({
    data: spatialFeature,
}: IDetailQueryResult<ISpatialFeatureViewModel>): JSX.Element => {
    const { id, geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${id} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${id} is missing its properties`);
    }

    const { name, description, imageUrl } = properties;

    const { type: geometryType, coordinates } = geometry;

    const CoordinatesPresenter = lookupTable[geometryType];

    if (CoordinatesPresenter === null || typeof CoordinatesPresenter === 'undefined') {
        throw new Error(
            `There is no thumbnail presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    /**
     * TODO Wrap additional non-coordinate presentation around this.
     */
    return (
        <div>
            <Card>
                <CardContent>
                    <CardHeader title={name} />
                    <img height="100px" src={imageUrl} alt={`Spatial Feature ${id}`} />
                    <br />
                    {description}
                    <br />

                    <Divider />
                    <CoordinatesPresenter coordinates={coordinates} />
                </CardContent>
            </Card>
        </div>
    );
};
