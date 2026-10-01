import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import L from 'leaflet';
import { useEffect, useRef } from 'react';

type MarkerPresenter = ({
    elRef,
    markerId,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    position,
}: {
    elRef: any;
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    position?: L.LatLng;
}) => JSX.Element;

type CoscradMapMarkerProps = {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    position?: L.LatLng;
    markerPresenter: MarkerPresenter;
};

export const CoscradMapMarkerPresenter = ({
    markerId,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    markerPresenter: MarkerPresenter,
}: CoscradMapMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    useEffect(() => {
        if (elRef.current) {
            elRef.current.openPopup();
        }
    }, []);

    return (
        <MarkerPresenter
            elRef={elRef}
            markerId={markerId}
            spatialFeature={spatialFeature}
            handleClick={handleClick}
            handleCancelNewPointMarker={handleCancelNewPointMarker}
        />
    );
};
