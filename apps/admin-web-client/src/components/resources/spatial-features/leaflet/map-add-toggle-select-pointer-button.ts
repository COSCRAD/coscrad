import L from 'leaflet';
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapAddToggleSelectPointerButtonProps {
    position?: L.ControlPosition;
    label: string;
    onClick: (map: L.Map) => void;
}

export const MapAddToggleSelectPointerButton = ({
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
