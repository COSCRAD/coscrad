import { useAuth0 } from '@auth0/auth0-react';
import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import L, { LatLngExpression, Icon as LeafletIcon, Marker as LeafletMarker, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef, useState } from 'react';
import { Popup as LeafletPopup, MapContainer, TileLayer, useMap } from 'react-leaflet';
import { INITIAL_CENTRE, INITIAL_ZOOM, MAP_HEIGHT_PX } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { NewPointLeafletMarker } from '../new-point-leaflet-marker';
import { SpatialFeatureMarker } from '../spatial-feature-marker';
import { useFetchSpatialFeaturesQuery } from '../store/spatial-feature.api';
import { CoscradMapMarkerPresenter } from './coscrad-map-marker';
import { MapAddToggleSelectPointerButton } from './map-add-toggle-select-pointer-button';
import { MapClickToAddSpatialFeatureHandler } from './map-click-to-add-spatial-feature-handler';
import { MapToggleSelectPointer } from './map-toggle-select-pointer';

const iconUrl = 'https://kaaltsidakah.net/raven/Map/XK-Xuuya.png';

const shadowUrl = 'https://kaaltsidakah.net/raven/Map/marker-shadow.png';

export const CoscradLeafletPopup = styled(LeafletPopup)({
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

    const { data, isFetching } = useFetchSpatialFeaturesQuery();

    const prevDataRef = useRef(data);

    useEffect(() => {
        console.log({ spatialFeatures });

        // Log only when data is successfully updated/mutated and changed
        if (data && data !== prevDataRef.current && !isFetching) {
            console.log('Child component detected mutated/updated data:', data);

            console.log({ mapMarkers });
        }
        prevDataRef.current = data;
    }, [data, isFetching, mapMarkers]);

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
