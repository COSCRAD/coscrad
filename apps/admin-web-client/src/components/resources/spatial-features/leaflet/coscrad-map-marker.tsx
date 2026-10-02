import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import L from 'leaflet';

type MarkerPresenter = ({
    markerId,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    position,
}: {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    position?: L.LatLng;
}) => JSX.Element;

type CoscradMapMarkerProps = {
    markerId: string;
    position?: L.LatLng;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    markerPresenter: MarkerPresenter;
};

export const CoscradMapMarkerPresenter = ({
    markerId,
    position,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    markerPresenter: MarkerPresenter,
}: CoscradMapMarkerProps): JSX.Element => {
    return (
        <MarkerPresenter
            markerId={markerId}
            position={position}
            spatialFeature={spatialFeature}
            handleClick={handleClick}
            handleCancelNewPointMarker={handleCancelNewPointMarker}
        />
    );
};
