import { LatLngExpression } from 'leaflet';
import { SinglePropertyPresenter } from '../../../utils/generic-components';
/**
 * This is an attempted fix from: https://stackoverflow.com/a/59523791
 * For some reason the shadow of the place marker is a broken image link
 */
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-shadow.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import './spatial-feature-index.presenter.css';

export const SpatialFeatureIndexPresenter = (indexResult: SpatialFeatureIndexState) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: detailResult } = indexResult;

    const spatialFeatures = detailResult.map(({ data }) => data);

    /**
     * Not sure where to get this from, can it can be derived from the spatial feature coordinates to be displayed?
     */
    const initialMapCentreCoordinates: LatLngExpression = [53.232942164270135, -127.70090919382334];

    /**
     * This is a workaround to get the default icon shadows (marker-shadow.png) to
     * display.  There may be a leaflet bug affecting this but I haven't tracked down official
     * documentation of it but it is reference here: https://stackoverflow.com/a/51232969
     */
    const DefaultIcon = L.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
    });

    L.Marker.prototype.options.icon = DefaultIcon;

    return (
        <>
            <MapContainer center={initialMapCentreCoordinates} zoom={6} scrollWheelZoom={false}>
                <TileLayer
                    attribution="&copy; ESRI and Contributors"
                    url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                />
                {spatialFeatures.map((spatialFeature, index) => {
                    const geometry = spatialFeature.geometry;
                    if (geometry.type == 'Point') {
                        const coordinates = geometry.coordinates as LatLngExpression;
                        return (
                            <Marker key={index} position={coordinates}>
                                <Popup>
                                    <SinglePropertyPresenter
                                        display="ID"
                                        value={spatialFeature.id}
                                    />
                                    <SinglePropertyPresenter
                                        display="Coordinates"
                                        value={`Lat: ${coordinates[0]}, Long: ${coordinates[1]}`}
                                    />
                                </Popup>
                            </Marker>
                        );
                    }
                })}
            </MapContainer>

            <div>
                <h3>JSON Data</h3>
                <pre>{JSON.stringify(spatialFeatures, null, 2)}</pre>
            </div>
        </>
    );
};
