import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import L, { LatLng, LatLngExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
    Popup as LeafletPopup,
    MapContainer,
    Marker as NewPointMarker,
    TileLayer,
    useMap,
    useMapEvents,
} from 'react-leaflet';
import { INITIAL_CENTRE, INITIAL_ZOOM, MAP_HEIGHT_PX } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { buildSpatialFeatureMarker } from './build-spatial-feature-marker';

const CoscradMapContainer = styled(MapContainer)({
    left: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    maxWidth: '100vw',
    position: 'relative',
    right: '50%',
    width: '100vw',
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

interface CreatePointFormProps {
    coordinates: LatLng;
}

const CreatePointForm = ({ coordinates }: CreatePointFormProps): JSX.Element => {
    console.log({ coordinates });

    const { lat, lng } = coordinates;

    return (
        <>
            <Box>Hello World</Box>
            <Box>Lat: {lat}</Box>
            <Box>Lat: {lng}</Box>
        </>
    );
};

const MapClickToAddSpatialFeatureHandler = ({ onMapClick, isSetPlaceMarkerMode }) => {
    useMapEvents({
        click(e) {
            if (isSetPlaceMarkerMode) {
                const { lat, lng } = e.latlng;

                onMapClick(e.latlng);

                console.log(`Map clicked at coordinates: ${lat}, ${lng}`);
            }
        },
    });

    return null;
};

const MapToggleSelectPointer = ({ isSetPlaceMarkerMode }) => {
    const map = useMap();

    console.log({ isSetPlaceMarkerMode });

    useEffect(() => {
        // Get the HTML container of the Leaflet map
        const mapContainer = map.getContainer();

        if (isSetPlaceMarkerMode) {
            // Force a pointer style
            mapContainer.style.cursor = 'pointer';
            // Temporarily remove leaflet's grab class to prevent cursor conflicts
            mapContainer.classList.remove('leaflet-grab');
        } else {
            // Reset back to default Leaflet behavior
            mapContainer.style.cursor = '';
            mapContainer.classList.add('leaflet-grab');
        }
    }, [isSetPlaceMarkerMode, map]);

    return null; // This component doesn't render any UI elements
};

interface MapAddToggleSelectPointerButtonProps {
    position?: L.ControlPosition;
    label: string;
    onClick: (map: L.Map) => void;
}

const MapAddToggleSelectPointerButton = ({
    position = 'topright',
    onClick,
    label,
}: MapAddToggleSelectPointerButtonProps) => {
    const map = useMap();

    useEffect(() => {
        // 1. Create a custom Leaflet Control subclass
        const CustomControl = L.Control.extend({
            options: {
                position: position,
            },
            onAdd: function () {
                // 2. Create the outer wrapper using standard Leaflet DOM utilities
                const container = L.DomUtil.create('div', 'leaflet-control leaflet-bar');

                // 3. Create the actual button
                const button = L.DomUtil.create('button', 'custom-map-button', container);
                button.innerHTML = label;
                button.type = 'button';

                // Basic styles to match Leaflet controls
                button.style.padding = '6px 10px';
                button.style.backgroundColor = '#fff';
                button.style.border = 'none';
                button.style.cursor = 'pointer';
                button.style.fontWeight = 'bold';
                button.title = 'Add Placemarker to Map';

                // 4. CRITICAL: Stop map clicks/scrolls from breaking through the button
                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                // 5. Setup event listener
                L.DomEvent.on(button, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    onClick(map);
                });

                return container;
            },
            onRemove: function () {
                // Leaflet handles DOM removal automatically when control.remove() is called
            },
        });

        // 6. Instantiate and add the control to the map
        const controlInstance = new CustomControl();
        controlInstance.addTo(map);

        // 7. Clean up the control instance when the component unmounts
        return () => {
            controlInstance.remove();
        };
    }, [map, position, onClick, label]);

    return null;
};

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
    const [isSetPlaceMarkerMode, setIsSetPlaceMarkerMode] = useState<boolean>(false);

    const [newPointMarkers, setNewPointMarkers] = useState([]);

    const mapRef = useRef<Map>();

    const handleAddMarker = (latlng) => {
        console.log({ latlng });

        // Add the new click location to the existing markers array
        setNewPointMarkers((prevMarkers) => [...prevMarkers, latlng]);
    };

    useEffect(() => {
        return;
    }, [mapRef]);

    /**
     * Not sure where to get this from, can it can be derived from the spatial feature coordinates to be displayed?
     */
    const initialMapCentreCoordinates: LatLngExpression = initialCentre || INITIAL_CENTRE;

    const SpatialFeatureMarker = buildSpatialFeatureMarker(spatialFeatureDetailPresenter);

    return (
        <CoscradMapContainer
            sx={{
                mt: { xs: '-3%', md: '-3.5%', qhd: '-5.5%', uhd: '-8%' },
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
            <MapClickToAddSpatialFeatureHandler
                onMapClick={handleAddMarker}
                isSetPlaceMarkerMode={isSetPlaceMarkerMode}
            />
            <MapToggleSelectPointer isSetPlaceMarkerMode={isSetPlaceMarkerMode} />
            <MapAddToggleSelectPointerButton
                position="topleft"
                label="Add Place <br /> Mode"
                onClick={() => setIsSetPlaceMarkerMode(!isSetPlaceMarkerMode)}
            />
            {newPointMarkers.map((position, idx) => (
                <NewPointMarker key={idx} position={position}>
                    <LeafletPopup>
                        <CreatePointForm coordinates={position} />
                    </LeafletPopup>
                </NewPointMarker>
            ))}
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
    );
};
