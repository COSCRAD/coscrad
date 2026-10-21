import { useAuth0 } from '@auth0/auth0-react';
import { AggregateType, ResourceCompositeIdentifier, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HubIcon from '@mui/icons-material/Hub';
import InfoIcon from '@mui/icons-material/Info';
import { Box, Grid, IconButton, styled, Tooltip, Typography } from '@mui/material';
import { PointTuple } from 'leaflet';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../../shared/build-data-attribute-for-aggregate-detail-component';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';
import { setFromResource, toggleBottomConnectionDrawer } from '../../../shared/store';
import { getOriginalTextItem } from '../../terms/term-detail.page';
import { spatialFeatureApi } from '../store/spatial-feature.api';

const StyledPlaceIcon = styled('img')({
    width: '60px',
});

interface SpatialFeatureDetailThumbnailPresenterProps {
    id: string;
    shouldDisplayActionButtons: boolean;
}

export const SpatialFeatureDetailThumbnailPresenter = ({
    id,
    shouldDisplayActionButtons,
}: SpatialFeatureDetailThumbnailPresenterProps): JSX.Element => {
    const { isAuthenticated } = useAuth0();

    const dispatch = useDispatch();

    /**
     * Using useQuery to re-fetch by id so that this presenter can be
     * used flexibly in different contexts.  Should be fixed with a better
     * pattern
     */
    const { geometry, properties, isLoading, isError } =
        spatialFeatureApi.endpoints.fetchSpatialFeatureById.useQuery(id, {
            skip: !id,
            selectFromResult: (result) => ({
                geometry: result.data?.geometry,
                properties: result.data?.properties,
                isLoading: result.isLoading,
                isError: result.isError,
            }),
        });

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (isError) return <div>Error retrieving place geometry.</div>;

    if (isNullOrUndefined(geometry) || isNullOrUndefined(properties))
        return <div>Geometry or Properties not loaded</div>;

    const { name, description } = properties;

    const originalName = getOriginalTextItem(name);

    const imageUrl = 'https://kaaltsidakah.net/raven/Map/Previews/XK-Xuuya-Preview.png';

    const { type: geometryType, coordinates } = geometry;

    const [lat, lng] = coordinates as unknown as PointTuple;

    const handleFromConnection = () => {
        const fromResourceCompositeIdentifier: ResourceCompositeIdentifier = {
            id,
            type: ResourceType.spatialFeature,
        };

        dispatch(setFromResource(fromResourceCompositeIdentifier));

        dispatch(toggleBottomConnectionDrawer(true));
    };

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
                <Typography variant="h4">Spatial Feature</Typography>
                <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                    <Typography variant="h5" sx={{ mr: 1 }}>
                        {originalName.text}
                    </Typography>
                    <IconButton sx={{ mt: -1 }}>
                        <Tooltip title={`ID: ${id}`}>
                            <InfoIcon />
                        </Tooltip>
                    </IconButton>
                </Box>
                <SinglePropertyPresenter display="Description" value={description.items[0].text} />
                <SinglePropertyPresenter display="Feature Type" value={geometryType} />
                <SinglePropertyPresenter display="Lat" value={lat} />
                <SinglePropertyPresenter display="Long" value={lng} />
            </Grid>
            {shouldDisplayActionButtons ? (
                <Grid item xs={12} container sx={{ justifyContent: 'flex-end' }}>
                    {isAuthenticated ? (
                        <Box sx={{ pl: 8 }}>
                            <Tooltip title="Create Connection">
                                <IconButton
                                    onClick={() => handleFromConnection()}
                                    aria-label="Create Connection"
                                    sx={{ ml: 0.5 }}
                                >
                                    <HubIcon sx={{ fontSize: '20px' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    ) : null}
                    {/* <Box sx={{ pl: 8 }}>
                            <Tooltip title="View Connections">
                                <Link to={`/spatialFeatures/${id}`}>
                                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                        <HubIcon sx={{ fontSize: '20px' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </Box> */}
                    <Box sx={{ pl: 1 }}>
                        <Tooltip title="View Full Record">
                            <Link to={`/spatialFeatures/${id}`}>
                                <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: '20px' }} />
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </Box>
                </Grid>
            ) : null}
        </Grid>
    );
};
