import {
    AggregateType,
    GeometricFeatureType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Grid, styled } from '@mui/material';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
import { buildDataAttributeForAggregateDetailComponent } from '../../../utils/generic-components/presenters/detail-views/build-data-attribute-for-aggregate-detail-component';
import { ResourceNamePresenter } from '../../../utils/generic-components/presenters/resource-name-presenter';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { LineTextPresenter } from './thumbnail-presenters/line-text-presenter';
import { PointTextPresenter } from './thumbnail-presenters/point-text-presenter';
import { PolygonTextPresenter } from './thumbnail-presenters/polygon-text-presenter';

interface HasCoordinates<T = unknown> {
    coordinates: T;
}

const lookupTable: { [K in GeometricFeatureType]: FunctionalComponent<HasCoordinates> } = {
    [GeometricFeatureType.point]: PointTextPresenter,
    [GeometricFeatureType.line]: LineTextPresenter,
    [GeometricFeatureType.polygon]: PolygonTextPresenter,
};

const StyledPlaceIcon = styled('img')({
    width: '66px',
});

export const SpatialFeatureDetailFullViewPresenter = (
    spatialFeature: ICategorizableDetailQueryResult<ISpatialFeatureViewModel>
): JSX.Element => {
    const { id, geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${id} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${id} is missing its properties`);
    }

    const { name, description, imageUrl } = properties;

    const { type: geometryType, coordinates } = geometry;

    const CoordinatesTextPresenter = lookupTable[geometryType];

    if (isNullOrUndefined(CoordinatesTextPresenter)) {
        throw new Error(
            `There is no coordinates text presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    return (
        <Grid container spacing={0}>
            <Grid item xs={3}>
                <div
                    data-testid={buildDataAttributeForAggregateDetailComponent(
                        AggregateType.spatialFeature,
                        id
                    )}
                />
                {/* Preview will eventually include images taken from video or photos, etc. */}
                <StyledPlaceIcon src={imageUrl} alt={`Spatial Feature ${id}`} />
            </Grid>
            <Grid item xs={9}>
                {/* TODO: consider putting a standardized name property on the view models */}
                <ResourceNamePresenter name={name} variant="h5" />
                <SinglePropertyPresenter display="ID" value={id} />
                <SinglePropertyPresenter display="Description" value={description} />
                <SinglePropertyPresenter display="Feature Type" value={geometryType} />
                <CoordinatesTextPresenter coordinates={coordinates} />
            </Grid>
        </Grid>
    );
};
