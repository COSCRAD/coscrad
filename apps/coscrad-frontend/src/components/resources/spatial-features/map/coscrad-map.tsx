import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';

export interface SpatialFeatureDetailPresenter {
    (spatialFeature: ISpatialFeatureViewModel): JSX.Element;
}

export interface CoscradMapProps {
    spatialFeatures: ISpatialFeatureViewModel[];
    initialCentre?: [number, number];
    initialZoom?: number;
    DetailPresenter: SpatialFeatureDetailPresenter;
}

export interface ICoscradMap {
    (props: CoscradMapProps): JSX.Element;
}
