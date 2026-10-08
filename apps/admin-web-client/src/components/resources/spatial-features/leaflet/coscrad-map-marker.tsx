import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import L from 'leaflet';

type MarkerPresenter = ({
    markerId,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    position,
    selectedSpatialFeatureId,
    setSelectedSpatialFeatureId,
}: {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    position?: L.LatLng;
    selectedSpatialFeatureId?: string;
    setSelectedSpatialFeatureId?: (id: string) => void;
}) => JSX.Element;

type CoscradMapMarkerProps = {
    markerId: string;
    position?: L.LatLng;
    spatialFeature?: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    handleCancelNewPointMarker?: (id: string) => void;
    markerPresenter: MarkerPresenter;
    selectedSpatialFeatureId?: string;
    setSelectedSpatialFeatureId?: (id: string) => void;
};

export const CoscradMapMarkerPresenter = ({
    markerId,
    position,
    spatialFeature,
    handleClick,
    handleCancelNewPointMarker,
    markerPresenter: MarkerPresenter,
    selectedSpatialFeatureId,
    setSelectedSpatialFeatureId,
}: CoscradMapMarkerProps): JSX.Element => {
    return (
        <MarkerPresenter
            markerId={markerId}
            position={position}
            spatialFeature={spatialFeature}
            handleClick={handleClick}
            handleCancelNewPointMarker={handleCancelNewPointMarker}
            selectedSpatialFeatureId={selectedSpatialFeatureId}
            setSelectedSpatialFeatureId={setSelectedSpatialFeatureId}
        />
    );
};
