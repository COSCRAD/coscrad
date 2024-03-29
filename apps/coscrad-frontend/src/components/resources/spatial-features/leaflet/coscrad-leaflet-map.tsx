import { styled } from '@mui/material';
import { LatLngExpression, Map } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import { INITIAL_CENTRE, INITIAL_ZOOM } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { buildSpatialFeatureMarker } from './spatial-feature-marker';

const CoscradMapContainer = styled(MapContainer)({
    left: '50%',
    marginLeft: '-50vw',
    marginRight: '-50vw',
    maxWidth: '100vw',
    position: 'relative',
    right: '50%',
    width: '100vw',
});

export const CoscradLeafletMap: ICoscradMap = ({
    spatialFeatures,
    initialCentre,
    initialZoom,
    /**
     * We inject the detail presenter to decouple the map from the presentation
     * of the spatial feature in the popup. In the future, we could inject
     * either the full-view or thumbnail view based on a config property.
     */
    DetailPresenter: spatialFeatureDetailPresenter,
    onSpatialFeatureSelected,
    selectedSpatialFeatureId,
}: CoscradMapProps) => {
    const mapRef = useRef<Map>();

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
                height: { xs: '80vh' },
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
            {spatialFeatures.map((spatialFeature) => (
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
            ))}
        </CoscradMapContainer>
    );
};
