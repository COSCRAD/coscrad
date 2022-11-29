import {
    GeometricFeatureType,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Icon as LeafletIcon, Marker as LeafletMarker } from 'leaflet';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';
import {
    Marker as PointMarker,
    Polygon as PolygonMarker,
    Polyline as PolylineMarker,
    Popup as LeafletPopup,
} from 'react-leaflet';
import { Link } from 'react-router-dom';
import { routes } from '../../../../app/routes/routes';
import { SinglePropertyPresenter } from '../../../../utils/generic-components';
import { SpatialFeatureDetailPresenter } from '../map';

interface MarkerPresenterProps<T = unknown> {
    spatialFeature: ISpatialFeatureViewModel<T>;
    DetailPresenter: SpatialFeatureDetailPresenter;
}

const lookupTable: {
    [K in GeometricFeatureType]: (props: MarkerPresenterProps) => JSX.Element;
} = {
    [GeometricFeatureType.point]: ({
        spatialFeature,
        DetailPresenter,
    }: MarkerPresenterProps<[number, number]>) => (
        <PointMarker
            key={spatialFeature.id}
            position={spatialFeature.geometry.coordinates as [number, number]}
        >
            <LeafletPopup>
                <SinglePropertyPresenter display="ID" value={spatialFeature.id} />
                <DetailPresenter {...spatialFeature} />
                {/* <PointPresenter coordinates={coordinates} /> */}
            </LeafletPopup>
        </PointMarker>
    ),
    [GeometricFeatureType.line]: ({
        spatialFeature,
        DetailPresenter,
    }: MarkerPresenterProps<[number, number][]>) => (
        <PolylineMarker positions={spatialFeature.geometry.coordinates}>
            <LeafletPopup>
                <SinglePropertyPresenter display="ID" value={spatialFeature.id} />
                <DetailPresenter {...spatialFeature} />
            </LeafletPopup>
        </PolylineMarker>
    ),
    [GeometricFeatureType.polygon]: ({
        spatialFeature,
        DetailPresenter,
    }: MarkerPresenterProps<[number, number][][]>) => (
        <PolygonMarker positions={spatialFeature.geometry.coordinates}>
            <LeafletPopup>
                <SinglePropertyPresenter display="ID" value={spatialFeature.id} />
                <DetailPresenter {...spatialFeature} />
                {/* <PolygonPresenter coordinates={coordinates} /> */}
            </LeafletPopup>
        </PolygonMarker>
    ),
};

/**
 * Note that we refer to any element that renders a spatial feature on a map
 * as a `Marker`. This is not exactly in keeping with Leaflet's terminology.
 */
export const buildSpatialFeatureMarker =
    (DetailPresenter: SpatialFeatureDetailPresenter) =>
    (
        //   TODO discriminate to type guard coordinates
        spatialFeature: ISpatialFeatureViewModel
    ): JSX.Element => {
        const {
            id,
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
            <Link to={`/${routes.resources.ofType(ResourceType.spatialFeature).detail(id)}`}>
                <Presenter spatialFeature={spatialFeature} DetailPresenter={DetailPresenter} />
            </Link>
        );
    };
