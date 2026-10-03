import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Button, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { Marker as ReactLeafletMarker } from 'react-leaflet';
import { useRightSidePanel } from '../../shared/side-panel/right-side-panel-provider';
import { SinglePropertyPresenter } from '../../shared/single-property-presenter';
import { CreatePointForm } from './create-point-form';
import { CoscradLeafletPopup } from './leaflet/coscrad-leaflet-map';

type NewPointLeafletMarkerProps = {
    markerId: string;
    position?: L.LatLng;
    handleCancelNewPointMarker?: (id) => void;
};

export const NewPointLeafletMarker = ({
    markerId,
    position,
    handleCancelNewPointMarker,
}: NewPointLeafletMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    const actionLabel = 'ADD NEW PLACE';

    const { openRightSidePanel } = useRightSidePanel();

    const openSidePanel = () => {
        console.log('open the side panel');

        openRightSidePanel(actionLabel, <CreatePointForm coordinates={position} />);
    };

    useEffect(() => {
        if (elRef.current) {
            elRef.current.openPopup();
        }
    }, []);

    if (isNullOrUndefined(position)) return null;

    return (
        <ReactLeafletMarker
            ref={elRef}
            key={markerId}
            position={position}
            eventHandlers={{
                add: (e) => {
                    const newPointMarkerToAdd = e.target;

                    const leafletMapInstance = newPointMarkerToAdd._map;

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
            <CoscradLeafletPopup
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
                    <Typography variant="h5">Dropped Pin</Typography>
                    <SinglePropertyPresenter display="Latitude" value={position.lat} />
                    <SinglePropertyPresenter display="Longitude" value={position.lng} />
                    <Box
                        sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                        }}
                    >
                        <Button
                            onClick={() => {
                                openSidePanel();
                            }}
                        >
                            {actionLabel}
                        </Button>
                    </Box>
                </Box>
            </CoscradLeafletPopup>
        </ReactLeafletMarker>
    );
};
