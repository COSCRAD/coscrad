import { useAuth0 } from '@auth0/auth0-react';
import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { Box, styled, Typography } from '@mui/material';
import L, { LatLngExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import {
    Marker as LeafletMarker,
    Popup as LeafletPopup,
    MapContainer,
    TileLayer,
    useMap,
} from 'react-leaflet';
import { SinglePropertyPresenter } from '../../../shared/single-property-presenter';
import { INITIAL_CENTRE, INITIAL_ZOOM, MAP_HEIGHT_PX } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { buildSpatialFeatureMarker } from './build-spatial-feature-marker';
import { CoscradMapMarkerPresenter } from './coscrad-map-marker';
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

    return (
        <LeafletMarker
            ref={elRef}
            key={markerId}
            position={position}
            eventHandlers={{
                add: (e) => {
                    const newPointMarkerToAdd = e.target;

                    const leafletMapInstance = newPointMarkerToAdd._map;

                    console.log({ markerId });

                    // setActiveNewPointPopupKey(newPointMarker.id);

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
            <LeafletPopup
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
                        value={`${position.lat}, ${position.lng}`}
                    />
                </Box>
                {/* <CreatePointForm coordinates={position} /> */}
            </LeafletPopup>
        </LeafletMarker>
    );
};

const MapAutoOpenPopup = ({ children, ...props }: any) => {
    const popupRef = useRef<L.Popup | null>(null);
    const map = useMap();

    useEffect(() => {
        // As soon as this popup mounts, force the map instance to open it immediately
        if (popupRef.current && typeof popupRef.current.getLatLng() !== undefined) {
            popupRef.current.openOn(map);
        }
    }, [map]);

    return (
        <LeafletPopup ref={popupRef} {...props}>
            {children}
        </LeafletPopup>
    );
};

enum CoscradMapMarkerEnum {
    new = 'new',
    fromDB = 'fromDB',
}

type CoscradMapMarker = {
    type: CoscradMapMarkerEnum;
    data: NewPointMarker | ISpatialFeatureViewModel;
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

    const [mapMarkers, setMapMarkers] = useState<CoscradMapMarker[]>([]);

    // const [activeNewPointPopupKey, setActiveNewPointPopupKey] = useState<string | null>(null);

    const [newPointMarker, setNewPointMarker] = useState<NewPointMarker>(null);

    const mapRef = useRef<Map>();

    // const markerRefs = useRef({});

    // const setMarkerRef = useCallback(
    //     (id) => (el) => {
    //         const markerEl = el as L.Marker;

    //         if (el) {
    //             console.log('el defined:', markerEl.getLatLng(), id);

    //             markerRefs.current[id] = el;
    //         } else {
    //             console.log('el undefined:', el, id);

    //             delete markerRefs.current[id];
    //         }
    //     },
    //     []
    // );

    // useEffect(() => {
    //     if (activeNewPointPopupKey) {
    //         const currentMarker = markerRefs.current[activeNewPointPopupKey];
    //         if (currentMarker && !currentMarker.isPopupOpen()) {
    //             currentMarker.openPopup();
    //         }
    //     }
    // }, [activeNewPointPopupKey]);

    const handleAddMarker = (latlng: L.LatLng) => {
        console.log('adding marker');
        console.log({ latlng });

        const newPointMarker: NewPointMarker = {
            id: `new-point-${crypto.randomUUID()}`,
            coordinates: latlng,
        };

        // Note: we could call the backend id generation, but there will be
        // too many cancelled placemarkers making for a bloated
        setNewPointMarker(newPointMarker);
        // const tempId = `new-point-${crypto.randomUUID()}`;

        // setNewPointMarkers((prevMarkers) => [...prevMarkers, newPointMarker]);
    };

    const handleCancelNewPointMarker = (markerIdToRemove) => {
        console.log('removing:', markerIdToRemove);

        // setActiveNewPointPopupKey(null);

        setNewPointMarker(null);

        // setNewPointMarkers((prevMarkers) =>
        //     prevMarkers.filter(({ id }) => id !== markerIdToRemove)
        // );
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
                        {/* {!isNullOrUndefined(newPointMarker) ? (
                            <NewPointLeafletMarker
                                markerId={newPointMarker.id}
                                position={newPointMarker.coordinates}
                                handleCancelNewPointMarker={handleCancelNewPointMarker}
                            />
                        ) : null} */}
                    </>
                ) : null}

                {mapMarkers.map((marker) => {
                    if (marker.type === CoscradMapMarkerEnum.new) {
                        const { id, coordinates } = marker.data as NewPointMarker;

                        return (
                            <CoscradMapMarkerPresenter
                                markerId={id}
                                position={coordinates}
                                handleCancelNewPointMarker={handleCancelNewPointMarker}
                                markerPresenter={NewPointLeafletMarker}
                            />
                        );
                    }
                })}
                {/* {!isNullOrUndefined(spatialFeatures) && spatialFeatures.length > 0
                    ? spatialFeatures.map((spatialFeature) => (
                          <SpatialFeatureMarker
                              key={spatialFeature.id}
                              spatialFeature={spatialFeature}
                              handleClick={onSpatialFeatureSelected}
                              customEffects={(id, marker) => {
                                  console.log('customEffects:', id);

                                  //   if (id === selectedSpatialFeatureId) {
                                  //       marker.openPopup();
                                  //   }
                              }}
                              selectedSpatialFeatureId={selectedSpatialFeatureId}
                          />
                      ))
                    : null} */}
            </CoscradMapContainer>
        </Box>
    );
};
