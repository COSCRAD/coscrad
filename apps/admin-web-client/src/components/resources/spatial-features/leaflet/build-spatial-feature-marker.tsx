import { GeometricFeatureType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { Icon as LeafletIcon, Marker as LeafletMarker, PointTuple } from 'leaflet';
import { PropsWithChildren, useEffect, useRef } from 'react';
import { Popup as LeafletPopup, Marker as PointMarker } from 'react-leaflet';
import { SpatialFeatureDetailPresenter } from '../map';
import { Position2D } from '../types';

interface MarkerPresenterProps<T = unknown> extends PropsWithChildren {
    spatialFeature: ISpatialFeatureViewModel<T>;
    DetailPresenter: SpatialFeatureDetailPresenter;
    handleClick?: (id: string) => void;
    /**
     * It is tricky to type this element reference because we are building
     * our own abstraction around leaflet \ react-leaflet markers.
     */
    /* eslint-disable */
    elRef: any;
}

const lookupTable: {
    [K in GeometricFeatureType]: (props: MarkerPresenterProps) => JSX.Element;
} = {
    [GeometricFeatureType.point]: ({
        spatialFeature,
        handleClick,
        children,
        elRef,
    }: MarkerPresenterProps<Position2D>) => (
        <PointMarker
            key={spatialFeature.id}
            position={spatialFeature.geometry.coordinates}
            eventHandlers={{
                click: () => handleClick(spatialFeature.id),
            }}
            ref={elRef}
        >
            {children}
        </PointMarker>
    ),
};

const iconUrl = 'https://kaaltsidakah.net/raven/Map/XK-Xuuya.png';

const shadowUrl = 'https://kaaltsidakah.net/raven/Map/marker-shadow.png';

interface Props {
    spatialFeature: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    /**
     * This marker is tricky to type because we are building our own abstraction
     * around react-leaflet \ leaflets less polymorphic API for points, lines,
     * and polygons.
     */
    // eslint-disable-next-line
    customEffects: (id: string, marker: any) => void;
}

const CoscradLeafletPopup = styled(LeafletPopup)({
    minWidth: '300px',
});

/**
 * Note that we refer to any element that renders a spatial feature on a map
 * as a `Marker`. This is not exactly in keeping with Leaflet's terminology.
 */
export const buildSpatialFeatureMarker =
    (DetailPresenter: SpatialFeatureDetailPresenter) =>
    ({ spatialFeature, handleClick, customEffects }: Props): JSX.Element => {
        const markerRef = useRef();

        useEffect(() => {
            customEffects(spatialFeature.id, markerRef.current);
        }, [markerRef, spatialFeature.id, customEffects]);

        const {
            geometry: { type: geometryType, coordinates },
        } = spatialFeature;

        const popupPosition = coordinates as unknown as PointTuple;

        /**
         * This is a workaround to get the default icon shadows (marker-shadow.png) to
         * display.  There may be a leaflet bug affecting this but I haven't tracked down official
         * documentation of it but it is referenced here: https://stackoverflow.com/a/51232969
         */
        const DefaultIcon = new LeafletIcon({
            iconUrl,
            shadowUrl,
            iconAnchor: [15, 41],
            shadowAnchor: [10, 42],
        });

        // TODO Fix this hack
        LeafletMarker.prototype.options.icon = DefaultIcon;

        const Presenter = lookupTable[geometryType];

        if (isNullOrUndefined(Presenter)) {
            throw new Error(
                `Failed to build a marker for spatial feature of unknown type: ${geometryType}`
            );
        }

        return (
            <Presenter
                spatialFeature={spatialFeature}
                DetailPresenter={DetailPresenter}
                handleClick={handleClick}
                elRef={markerRef}
            >
                <CoscradLeafletPopup>
                    <div className="spatialMarker" data-testid={spatialFeature.id} />
                    <DetailPresenter {...spatialFeature} />
                </CoscradLeafletPopup>
            </Presenter>
        );
    };
