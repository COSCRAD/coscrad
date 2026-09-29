import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

export const MapToggleSelectPointer = ({ isSetPlaceMarkerMode }) => {
    const map = useMap();

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
