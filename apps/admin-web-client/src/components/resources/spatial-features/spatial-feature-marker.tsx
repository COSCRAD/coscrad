import {
    AggregateCompositeIdentifier,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { PointTuple } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useEffect, useRef } from 'react';
import { Marker as ReactLeafletMarker } from 'react-leaflet';
import { useDispatch, useSelector } from 'react-redux';
import { selectConnectionState, setToResource } from '../../shared/store';
import { CoscradLeafletPopup } from './leaflet/coscrad-leaflet-map';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';

type SpatialFeatureMarkerProps = {
    markerId: string;
    spatialFeature?: ISpatialFeatureViewModel;
    selectedSpatialFeatureId: string;
    setSelectedSpatialFeatureId?: (id: string) => void;
};

export const SpatialFeatureMarker = ({
    markerId,
    spatialFeature,
    selectedSpatialFeatureId,
    setSelectedSpatialFeatureId,
}: SpatialFeatureMarkerProps): JSX.Element => {
    const elRef = useRef(null);

    const dispatch = useDispatch();

    const openConnectionResourceFrom: AggregateCompositeIdentifier =
        useSelector(selectConnectionState);

    if (
        !isNullOrUndefined(openConnectionResourceFrom) &&
        !isNullOrUndefined(selectedSpatialFeatureId)
    ) {
        if (openConnectionResourceFrom.id !== selectedSpatialFeatureId) {
            console.log(openConnectionResourceFrom.id, selectedSpatialFeatureId);

            const toAggregateCompositeIdentifier: AggregateCompositeIdentifier = {
                type: ResourceType.spatialFeature,
                id: selectedSpatialFeatureId,
            };

            dispatch(setToResource(toAggregateCompositeIdentifier));
        }
    }

    const { geometry } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${markerId} is missing geometry definition`);
    }

    useEffect(() => {
        console.log(`trying to open popup of new spatial feature ${selectedSpatialFeatureId}`);

        if (elRef.current && spatialFeature.id === selectedSpatialFeatureId) {
            elRef.current.openPopup();
        }
    }, [selectedSpatialFeatureId, spatialFeature.id]);

    // const { name, description } = properties;

    // const originalName = getOriginalTextItem(name);

    const { coordinates } = geometry;

    const [lat, lng] = coordinates as unknown as PointTuple;

    return (
        <ReactLeafletMarker
            key={markerId}
            position={[lat, lng]}
            ref={elRef}
            eventHandlers={{
                click: () => setSelectedSpatialFeatureId(spatialFeature.id),
            }}
        >
            <CoscradLeafletPopup>
                <SpatialFeatureDetailThumbnailPresenter
                    id={markerId}
                    shouldDisplayActionButtons={true}
                />
            </CoscradLeafletPopup>
        </ReactLeafletMarker>
    );
};
