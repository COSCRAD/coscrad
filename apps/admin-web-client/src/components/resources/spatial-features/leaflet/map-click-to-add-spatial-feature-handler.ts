import { useMapEvents } from 'react-leaflet';

export const MapClickToAddSpatialFeatureHandler = ({ onMapClick, isSetPlaceMarkerMode }) => {
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
