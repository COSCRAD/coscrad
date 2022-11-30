import LeafletJS, { LatLngExpression } from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';

export const MapTest = (): JSX.Element => {
    const DefaultIcon = LeafletJS.icon({
        iconUrl: icon,
        shadowUrl: iconShadow,
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        shadowSize: [68, 95],
        shadowAnchor: [20, 95],
    });

    LeafletJS.Marker.prototype.options.icon = DefaultIcon;

    const position: LatLngExpression = [53.995924308434205, -131.84155313741104];

    return (
        <MapContainer
            style={{ height: '600px' }}
            center={position}
            zoom={17}
            scrollWheelZoom={true}
        >
            <TileLayer
                attribution="&copy; ESRI and Contributors"
                url="http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
            <Marker position={[54.0405963818755, -132.18796768069117]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
            <Marker position={[53.995924308434205, -131.84155313741104]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
            <Marker position={[53.95240685286716, -130.5251403007973]}>
                <Popup>
                    A pretty CSS3 popup. <br /> Easily customizable.
                </Popup>
            </Marker>
        </MapContainer>
    );
};
