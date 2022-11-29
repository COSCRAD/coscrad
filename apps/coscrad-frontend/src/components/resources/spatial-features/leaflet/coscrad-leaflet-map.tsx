import { LatLngExpression } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import { INITIAL_CENTRE, INITIAL_ZOOM } from '../constants';
import { CoscradMapProps, ICoscradMap } from '../map';
import { buildSpatialFeatureMarker } from './spatial-feature-marker';

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
}: CoscradMapProps) => {
    /**
     * Not sure where to get this from, can it can be derived from the spatial feature coordinates to be displayed?
     */
    const initialMapCentreCoordinates: LatLngExpression = initialCentre || INITIAL_CENTRE;

    const SpatialFeatureMarker = buildSpatialFeatureMarker(spatialFeatureDetailPresenter);

    return (
        <MapContainer
            center={initialMapCentreCoordinates}
            zoom={initialZoom || INITIAL_ZOOM}
            // Inject through API?
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution="&copy; ESRI and Contributors"
                // Should this be part of the config?
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            {spatialFeatures.map((spatialFeature) => (
                <SpatialFeatureMarker {...spatialFeature} />
            ))}
        </MapContainer>
    );
};
