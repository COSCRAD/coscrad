import { useAuth0 } from '@auth0/auth0-react';
import { AggregateType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { Box, Grid, IconButton, styled, Typography } from '@mui/material';
import L, {
    LatLngExpression,
    Icon as LeafletIcon,
    Marker as LeafletMarker,
    Map,
    PointTuple,
} from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
    Popup as LeafletPopup,
    MapContainer,
    Marker as ReactLeafletMarker,
    TileLayer,
    useMap,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import { buildDataAttributeForAggregateDetailComponent } from '../../../shared/build-data-attribute-for-aggregate-detail-component';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';
import { getOriginalTextItem } from '../../terms/term-detail.page';
import { INITIAL_CENTRE, INITIAL_ZOOM, MAP_HEIGHT_PX } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { CoscradMapMarkerPresenter } from './coscrad-map-marker';
import { MapAddToggleSelectPointerButton } from './map-add-toggle-select-pointer-button';
import { MapClickToAddSpatialFeatureHandler } from './map-click-to-add-spatial-feature-handler';
import { MapToggleSelectPointer } from './map-toggle-select-pointer';

const iconUrl = 'https://kaaltsidakah.net/raven/Map/XK-Xuuya.png';

const shadowUrl = 'https://kaaltsidakah.net/raven/Map/marker-shadow.png';

const CoscradLeafletPopup = styled(LeafletPopup)({
    minWidth: '300px',
});

const ControlMapView = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

type NewPointLeafletMarkerProps = {
    markerId: string;
    position?: L.LatLng;
    handleCancelNewPointMarker?: (id) => void;
};

const NewPointLeafletMarker = ({
    markerId,
    position,
    handleCancelNewPointMarker,
}: NewPointLeafletMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    useEffect(() => {
        if (elRef.current) {
            elRef.current.openPopup();
        }
    }, []);

    if (isNullOrUndefined(position)) return null;

    return (
        <ReactLeafletMarker
            ref={elRef}
            key={markerId}
            position={position}
            eventHandlers={{
                add: (e) => {
                    const newPointMarkerToAdd = e.target;

                    const leafletMapInstance = newPointMarkerToAdd._map;

                    console.log({ markerId });

                    leafletMapInstance.flyTo(
                        newPointMarkerToAdd.getLatLng(),
                        leafletMapInstance.getZoom(),
                        {
                            animate: true,
                            duration: 0.8, // Duration of the animation in seconds
                        }
                    );
                },
            }}
        >
            <CoscradLeafletPopup
                eventHandlers={{
                    remove: (e) => {
                        const mouseEvent = e as any;

                        if (mouseEvent.originalEvent) {
                            L.DomEvent.stopPropagation(mouseEvent.originalEvent);
                        }

                        handleCancelNewPointMarker(markerId);
                    },
                }}
            >
                <Box>
                    <Typography variant="h5">Create New Place</Typography>
                    <SinglePropertyPresenter
                        display="Coordinates"
                        value={JSON.stringify(position)}
                    />
                </Box>
                {/* <CreatePointForm coordinates={position} /> */}
            </CoscradLeafletPopup>
        </ReactLeafletMarker>
    );
};

const StyledPlaceIcon = styled('img')({
    width: '60px',
});

type SpatialFeatureMarkerProps = {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
};

const SpatialFeatureMarker = ({
    markerId,
    spatialFeature,
    handleClick,
}: SpatialFeatureMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    const { geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${markerId} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${markerId} is missing its properties`);
    }

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
                                markerId
                            )}
                        />
                        {/* Preview will eventually include images taken from video or photos, etc. */}
                        <StyledPlaceIcon src={imageUrl} alt={`Spatial Feature ${markerId}`} />
                    </Grid>
                    <Grid item xs={9}>
                        <Typography variant="h5">{originalName.text}</Typography>
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
                            <Link to={`/spatialFeatures/${markerId}`}>
                                <IconButton aria-label="navigate to resource" sx={{ ml: 0.5 }}>
                                    <ArrowForwardIosIcon sx={{ fontSize: '20px' }} />
                                </IconButton>
                            </Link>
                        </Box>
                    </Grid>
                </Grid>
            </CoscradLeafletPopup>
        </ReactLeafletMarker>
    );
};

enum CoscradMapMarkerEnum {
    new = 'new',
    fromDB = 'fromDB',
}

type CoscradMapMarker = {
    markerId: string;
    type: CoscradMapMarkerEnum;
    data: NewPointMarker | ISpatialFeatureViewModel;
};

type NewPointMarker = {
    id: string;
    position: L.LatLng;
};

const CoscradMapContainer = styled(MapContainer)({
    maxWidth: '100vw',
    width: '100vw',
});

export const CoscradLeafletMap: ICoscradMap = ({
    spatialFeatures,
    initialCentre,
    initialZoom,
    mapHeightPx,
    /**
     * We inject the detail presenter to decouple the map from the presentation
     * of the spatial feature in the popup. In the future, we could inject
     * either the full-view or thumbnail view based on a config property.
     */
    onSpatialFeatureSelected,
    selectedSpatialFeatureId,
}: CoscradMapProps) => {
    const { isAuthenticated } = useAuth0();

    const [isSetPlaceMarkerMode, setIsSetPlaceMarkerMode] = useState<boolean>(false);

    const [mapMarkers, setMapMarkers] = useState<CoscradMapMarker[]>([]);

    const mapRef = useRef<Map>();

    const spatialFeatureMapMarkers: CoscradMapMarker[] = spatialFeatures?.map((spatialFeature) => ({
        markerId: spatialFeature.id,
        type: CoscradMapMarkerEnum.fromDB,
        data: spatialFeature,
    }));

    if (
        !isNullOrUndefined(spatialFeatures) &&
        spatialFeatures.length > 0 &&
        mapMarkers.length === 0
    )
        setMapMarkers((prevMarkers) => [...prevMarkers, ...spatialFeatureMapMarkers]);

    const DefaultIcon = new LeafletIcon({
        iconUrl,
        shadowUrl,
        iconAnchor: [15, 41],
        shadowAnchor: [10, 42],
    });

    // TODO Fix this hack
    LeafletMarker.prototype.options.icon = DefaultIcon;

    const handleAddMarker = (latlng: L.LatLng) => {
        console.log('adding marker');
        console.log({ latlng });

        // Note: we could call the backend id generation, but there will be
        // too many cancelled placemarkers making for a bloated uuid collection
        const newPointMarker: NewPointMarker = {
            id: `new-point-${crypto.randomUUID()}`,
            position: latlng,
        };

        const newCoscradMapMarker: CoscradMapMarker = {
            markerId: newPointMarker.id,
            type: CoscradMapMarkerEnum.new,
            data: newPointMarker,
        };

        setMapMarkers((prevMarker) => [...prevMarker, newCoscradMapMarker]);
    };

    const handleCancelNewPointMarker = (markerIdToRemove) => {
        console.log('removing:', markerIdToRemove);

        setMapMarkers((prevMarkers) =>
            prevMarkers.filter(({ markerId }) => markerId !== markerIdToRemove)
        );
    };

    /**
     * Not sure where to get this from, can it can be derived from the spatial feature coordinates to be displayed?
     */
    const initialMapCentreCoordinates: LatLngExpression = initialCentre || INITIAL_CENTRE;

    return (
        <Box
            sx={{
                border: '1px solid #000',
                mt: '64px',
                width: '100vw',
                // mt: { xs: '-3%', md: '-3.5%', qhd: '-2.5%', uhd: '-8%' },
                // // mr: { xs: '-3%', md: '-3.5%', qhd: '-2.5%', uhd: '-8%' },
                // ml: { xs: '-3%', md: '-3.5%', qhd: '-55%', uhd: '-8%' },
                height: { xs: `${mapHeightPx || MAP_HEIGHT_PX}vh` },
            }}
        >
            <CoscradMapContainer
                sx={{
                    height: { xs: `${mapHeightPx || MAP_HEIGHT_PX}vh` },
                }}
                center={initialMapCentreCoordinates || INITIAL_CENTRE}
                zoom={initialZoom || INITIAL_ZOOM}
                // Inject through API?
                scrollWheelZoom={true}
                ref={mapRef}
            >
                <div data-cy="Map Container" />
                <TileLayer
                    attribution="&copy; ESRI and Contributors"
                    // Should this be part of the config?
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                <ControlMapView
                    center={initialMapCentreCoordinates || INITIAL_CENTRE}
                    zoom={initialZoom || INITIAL_ZOOM}
                />
                {isAuthenticated ? (
                    <>
                        <MapAddToggleSelectPointerButton
                            position="topleft"
                            label="Add Place <br /> Mode"
                            onClick={() => setIsSetPlaceMarkerMode(!isSetPlaceMarkerMode)}
                        />
                        <MapToggleSelectPointer isSetPlaceMarkerMode={isSetPlaceMarkerMode} />
                        <MapClickToAddSpatialFeatureHandler
                            onMapClick={handleAddMarker}
                            isSetPlaceMarkerMode={isSetPlaceMarkerMode}
                        />
                    </>
                ) : null}

                {mapMarkers.map((marker) => {
                    if (marker.type === CoscradMapMarkerEnum.new) {
                        const { id, position } = marker.data as NewPointMarker;

                        if (!position || !position.lat || !position.lng) return null;

                        return (
                            <CoscradMapMarkerPresenter
                                key={`new-marker-presenter-${id}`}
                                markerId={id}
                                position={position}
                                handleCancelNewPointMarker={handleCancelNewPointMarker}
                                markerPresenter={NewPointLeafletMarker}
                            />
                        );
                    } else {
                        const spatialFeature = marker.data as ISpatialFeatureViewModel;

                        return (
                            <CoscradMapMarkerPresenter
                                key={`marker-presenter-${spatialFeature.id}`}
                                markerId={spatialFeature.id}
                                markerPresenter={SpatialFeatureMarker}
                                spatialFeature={spatialFeature}
                            />
                        );
                    }
                })}
            </CoscradMapContainer>
        </Box>
    );
};
