import { useAuth0 } from '@auth0/auth0-react';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled, Typography } from '@mui/material';
import L, { LatLngExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
    Popup as LeafletPopup,
    MapContainer,
    Marker as NewPointMarker,
    TileLayer,
    useMap,
} from 'react-leaflet';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';
import { INITIAL_CENTRE, INITIAL_ZOOM, MAP_HEIGHT_PX } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { buildSpatialFeatureMarker } from './build-spatial-feature-marker';
import { MapAddToggleSelectPointerButton } from './map-add-toggle-select-pointer-button';
import { MapClickToAddSpatialFeatureHandler } from './map-click-to-add-spatial-feature-handler';
import { MapToggleSelectPointer } from './map-toggle-select-pointer';

const ControlMapView = ({ center, zoom }) => {
    const map = useMap();

    useEffect(() => {
        if (center) {
            map.setView(center, zoom);
        }
    }, [center, zoom, map]);
    return null;
};

type NewPointMarker = {
    id: string;
    coordinates: L.LatLng;
};

const CoscradMapContainer = styled(MapContainer)({
    // left: '50%',
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
    DetailPresenter: spatialFeatureDetailPresenter,
    onSpatialFeatureSelected,
    selectedSpatialFeatureId,
}: CoscradMapProps) => {
    const { isAuthenticated } = useAuth0();

    const [isSetPlaceMarkerMode, setIsSetPlaceMarkerMode] = useState<boolean>(false);

    const [newPointMarkers, setNewPointMarkers] = useState<NewPointMarker[]>([]);

    const mapRef = useRef<Map>();

    const handleAddMarker = (latlng: L.LatLng) => {
        console.log('adding marker');
        console.log({ latlng });

        // Note: we could call the backend id generation, but there will be
        // too many cancelled placemarkers making for a bloated
        const tempId = crypto.randomUUID();

        const newPointMarker: NewPointMarker = {
            id: tempId,
            coordinates: latlng,
        };

        setNewPointMarkers((prevMarkers) => [...prevMarkers, newPointMarker]);
    };

    const handleCancelNewPointMarker = (markerIdToRemove) => {
        setNewPointMarkers((prevMarkers) =>
            prevMarkers.filter(({ id }) => id !== markerIdToRemove)
        );
    };

    /**
     * Not sure where to get this from, can it can be derived from the spatial feature coordinates to be displayed?
     */
    const initialMapCentreCoordinates: LatLngExpression = initialCentre || INITIAL_CENTRE;

    const SpatialFeatureMarker = buildSpatialFeatureMarker(spatialFeatureDetailPresenter);

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
                        {newPointMarkers.map(({ coordinates, id }) => (
                            <NewPointMarker
                                key={id}
                                position={coordinates}
                                eventHandlers={{
                                    add: (e) => {
                                        const newPointMarker = e.target;

                                        const leafletMapInstance = newPointMarker._map;

                                        newPointMarker.openPopup();

                                        leafletMapInstance.flyTo(
                                            newPointMarker.getLatLng(),
                                            leafletMapInstance.getZoom(),
                                            {
                                                animate: true,
                                                duration: 0.8, // Duration of the animation in seconds
                                            }
                                        );
                                    },
                                }}
                            >
                                <LeafletPopup
                                    eventHandlers={{
                                        remove: () => handleCancelNewPointMarker(id),
                                    }}
                                >
                                    <Box>
                                        <Typography variant="h5">Create New Place</Typography>
                                        <SinglePropertyPresenter
                                            display="Coordinates"
                                            value={`${coordinates.lat}, ${coordinates.lng}`}
                                        />
                                    </Box>
                                    {/* <CreatePointForm coordinates={position} /> */}
                                </LeafletPopup>
                            </NewPointMarker>
                        ))}
                    </>
                ) : null}
                {!isNullOrUndefined(spatialFeatures) && spatialFeatures.length > 0
                    ? spatialFeatures.map((spatialFeature) => (
                          <SpatialFeatureMarker
                              key={spatialFeature.id}
                              spatialFeature={spatialFeature}
                              handleClick={onSpatialFeatureSelected}
                              customEffects={(id, marker) => {
                                  if (id === selectedSpatialFeatureId) {
                                      marker.openPopup();
                                  }
                              }}
                          />
                      ))
                    : null}
            </CoscradMapContainer>
        </Box>
    );
};
