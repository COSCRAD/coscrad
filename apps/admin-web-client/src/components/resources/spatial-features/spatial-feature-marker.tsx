import { AggregateType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import HubIcon from '@mui/icons-material/Hub';
import { Box, Grid, IconButton, styled, Tooltip, Typography } from '@mui/material';
import { PointTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { Marker as ReactLeafletMarker } from 'react-leaflet';
import { Link } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../shared/build-data-attribute-for-aggregate-detail-component';
import { SinglePropertyPresenter } from '../../shared/single-property-presenter';
import { toggleBottomConnectionDrawer } from '../../shared/store/connection.slice';
import { getOriginalTextItem } from '../terms/term-detail.page';
import { CoscradLeafletPopup } from './leaflet/coscrad-leaflet-map';

const StyledPlaceIcon = styled('img')({
    width: '60px',
});

type SpatialFeatureMarkerProps = {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    selectedSpatialFeatureId: string;
};

export const SpatialFeatureMarker = ({
    markerId,
    spatialFeature,
    handleClick,
    selectedSpatialFeatureId,
}: SpatialFeatureMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    const { geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${markerId} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${markerId} is missing its properties`);
    }

    useEffect(() => {
        console.log(`trying to open popup of new spatial feature ${selectedSpatialFeatureId}`);

        if (elRef.current && spatialFeature.id === selectedSpatialFeatureId) {
            elRef.current.openPopup();
        }
    }, [selectedSpatialFeatureId, spatialFeature.id]);

    const { name, description } = properties;

    const originalName = getOriginalTextItem(name);

    const imageUrl = 'https://kaaltsidakah.net/raven/Map/Previews/XK-Xuuya-Preview.png';

    const { type: geometryType, coordinates } = geometry;

    const [lat, lng] = coordinates as unknown as PointTuple;

    return (
        <ReactLeafletMarker key={markerId} position={[lat, lng]} ref={elRef}>
            <CoscradLeafletPopup>
                <Grid container spacing={0}>
                    <Grid item xs={3}>
                        <div
                            data-testid={buildDataAttributeForAggregateDetailComponent(
                                AggregateType.spatialFeature,
                                spatialFeature.id
                            )}
                        />
                        {/* Preview will eventually include images taken from video or photos, etc. */}
                        <StyledPlaceIcon src={imageUrl} alt={`Spatial Feature ${markerId}`} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h5">{originalName.text}</Typography>
                        <SinglePropertyPresenter display="Feature Id" value={spatialFeature.id} />
                        <SinglePropertyPresenter
                            display="Description"
                            value={description.items[0].text}
                        />
                        <SinglePropertyPresenter display="Feature Type" value={geometryType} />
                        <SinglePropertyPresenter display="Lat" value={lat} />
                        <SinglePropertyPresenter display="Long" value={lng} />
                    </Grid>
                    <Grid item xs={12} container sx={{ justifyContent: 'flex-end' }}>
                        <Box sx={{ pl: 8 }}>
                            <Tooltip title="Create Connection">
                                <IconButton
                                    onClick={() => toggleBottomConnectionDrawer(true)}
                                    aria-label="Create Connection"
                                    sx={{ ml: 0.5 }}
                                >
                                    <HubIcon sx={{ fontSize: '20px' }} />
                                </IconButton>
                            </Tooltip>
                        </Box>
                        {/* <Box sx={{ pl: 8 }}>
                            <Tooltip title="View Connections">
                                <Link to={`/spatialFeatures/${markerId}`}>
                                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                        <HubIcon sx={{ fontSize: '20px' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </Box> */}
                        <Box sx={{ pl: 1 }}>
                            <Tooltip title="View Full Record">
                                <Link to={`/spatialFeatures/${markerId}`}>
                                    <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                        <ArrowForwardIosIcon sx={{ fontSize: '20px' }} />
                                    </IconButton>
                                </Link>
                            </Tooltip>
                        </Box>
                    </Grid>
                </Grid>
            </CoscradLeafletPopup>
        </ReactLeafletMarker>
    );
};
