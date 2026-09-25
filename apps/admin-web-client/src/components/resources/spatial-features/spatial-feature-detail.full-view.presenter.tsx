import { AggregateType, GeometricFeatureType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Grid, styled, Typography } from '@mui/material';
import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../shared/build-data-attribute-for-aggregate-detail-component';
import { SinglePropertyPresenter } from '../../shared/single-property-presenter';
import { FunctionalComponent } from '../../shared/types';
import { getOriginalTextItem } from '../terms/term-detail.page';
import { CoscradLeafletMap } from './leaflet';
import { useFetchSpatialFeaturesQuery } from './store/spatial-feature.api';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';
import { PointTextPresenter } from './thumbnail-presenters/point-text-presenter';
import { Position2D } from './types';

const CoscradMapDetailContainer = styled(Box)({
    marginBottom: '20px',
});

interface HasCoordinates<T = unknown> {
    coordinates: T;
}

const lookupTable: { [K in GeometricFeatureType]: FunctionalComponent<HasCoordinates> } = {
    [GeometricFeatureType.point]: PointTextPresenter,
};

const StyledPlaceIcon = styled('img')({
    width: '66px',
});

export const SpatialFeatureDetailFullViewPresenter = (): JSX.Element => {
    const { id } = useParams();

    const [selectedSpatialFeatureId, setSelectedSpatialFeatureId] = useState<string>(null);

    const { spatialFeature, isLoading, isError } = useFetchSpatialFeaturesQuery(undefined, {
        selectFromResult: ({ data, isLoading, isError }) => ({
            spatialFeature: data?.entities.find((item) => item.id === id),
            isLoading,
            isError,
        }),
    });

    if (isLoading || !spatialFeature) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving spatial feature.</div>;

    const { geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${id} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${id} is missing its properties`);
    }

    const { name, description, imageUrl } = properties;

    const originalName = getOriginalTextItem(name);

    const originalDescription = getOriginalTextItem(description);

    const { type: geometryType, coordinates } = geometry;

    const CoordinatesTextPresenter = lookupTable[geometryType];

    const initialZoom = 13;

    const initialCentre = coordinates as unknown as Position2D;

    const mapHeightPx = 40;

    if (isNullOrUndefined(CoordinatesTextPresenter)) {
        throw new Error(
            `There is no coordinates text presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    return (
        <>
            <CoscradMapDetailContainer>
                <CoscradLeafletMap
                    spatialFeatures={[spatialFeature]}
                    initialZoom={initialZoom}
                    initialCentre={initialCentre}
                    mapHeightPx={mapHeightPx}
                    onSpatialFeatureSelected={(id: string) => setSelectedSpatialFeatureId(id)}
                    DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
                    selectedSpatialFeatureId={selectedSpatialFeatureId}
                />
            </CoscradMapDetailContainer>
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
                    <Typography variant="h5">{originalName.text}</Typography>
                    <SinglePropertyPresenter display="ID" value={id} />
                    <SinglePropertyPresenter
                        display="Description"
                        value={originalDescription.text}
                    />
                    <SinglePropertyPresenter display="Feature Type" value={geometryType} />
                    <CoordinatesTextPresenter coordinates={coordinates} />
                </Grid>
            </Grid>
        </>
    );
};
