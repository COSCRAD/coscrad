import { GeometricFeatureType, ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { Icon as LeafletIcon, Marker as LeafletMarker } from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import { PropsWithChildren, useEffect, useRef } from 'react';
import {
    Marker as PointMarker,
    Polygon as PolygonMarker,
    Polyline as PolylineMarker,
    Popup as LeafletPopup,
} from 'react-leaflet';
import { SinglePropertyPresenter } from '../../../../utils/generic-components';
import { SpatialFeatureDetailPresenter } from '../map';
import { Line2D, MultiPolygon2D, Position2D } from '../types';

interface MarkerPresenterProps<T = unknown> extends PropsWithChildren {
    spatialFeature: ISpatialFeatureViewModel<T>;
    DetailPresenter: SpatialFeatureDetailPresenter;
    handleClick?: (id: string) => void;
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
    [GeometricFeatureType.line]: ({
        spatialFeature,
        handleClick,
        children,
        elRef,
    }: MarkerPresenterProps<Line2D>) => (
        <PolylineMarker
            positions={spatialFeature.geometry.coordinates}
            eventHandlers={{
                click: () => handleClick(spatialFeature.id),
            }}
            ref={elRef}
        >
            {children}
        </PolylineMarker>
    ),
    [GeometricFeatureType.polygon]: ({
        spatialFeature,
        handleClick,
        children,
        elRef,
    }: MarkerPresenterProps<MultiPolygon2D>) => (
        <PolygonMarker
            positions={spatialFeature.geometry.coordinates}
            eventHandlers={{
                click: () => handleClick(spatialFeature.id),
            }}
            ref={elRef}
        >
            {children}
        </PolygonMarker>
    ),
};

interface Props {
    spatialFeature: ISpatialFeatureViewModel;
    handleClick?: (id: string) => void;
    customEffects: (id: string, marker: any) => void;
}

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
            geometry: { type: geometryType },
        } = spatialFeature;

        /**
         * This is a workaround to get the default icon shadows (marker-shadow.png) to
         * display.  There may be a leaflet bug affecting this but I haven't tracked down official
         * documentation of it but it is reference here: https://stackoverflow.com/a/51232969
         */
        const DefaultIcon = new LeafletIcon({
            iconUrl,
            shadowUrl,
            iconAnchor: [12, 41],
            shadowAnchor: [20, 95],
        });

        // TODO Fix this hack
        LeafletMarker.prototype.options.icon = DefaultIcon;

        const Presenter = lookupTable[geometryType];

        if (Presenter === null || typeof Presenter === 'undefined') {
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
                <LeafletPopup>
                    <SinglePropertyPresenter display="ID" value={spatialFeature.id} />
                    <DetailPresenter {...spatialFeature} />
                </LeafletPopup>
            </Presenter>
        );
    };
