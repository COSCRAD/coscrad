import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';
import { Position2D } from '../types';

export interface SpatialFeatureDetailPresenter {
    (spatialFeature: ISpatialFeatureViewModel): JSX.Element;
}

export interface CoscradMapProps {
    spatialFeatures: ISpatialFeatureViewModel[];
    initialCentre?: Position2D;
    initialZoom?: number;
    onSpatialFeatureSelected?: (id: string) => void;
    DetailPresenter: SpatialFeatureDetailPresenter;
    selectedSpatialFeatureId: string;
}

/**
 * We program our spatial features to this abstraction. This keeps us
 * loosely coupled to `Leaflet` \ `react-leaflet` and makes it easy to handle
 * the map differently based on environment (E.g. mobile apps) or to switch
 * in the future.
 */
export interface ICoscradMap {
    (props: CoscradMapProps): JSX.Element;
}
