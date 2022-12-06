import { ISpatialFeatureViewModel } from '@coscrad/api-interfaces';

export interface SpatialFeatureDetailPresenter {
    (spatialFeature: ISpatialFeatureViewModel): JSX.Element;
}

export interface CoscradMapProps {
    spatialFeatures: ISpatialFeatureViewModel[];
    initialCentre?: [number, number];
    initialZoom?: number;
    onSpatialFeatureSelected?: (id: string) => void;
    DetailPresenter: SpatialFeatureDetailPresenter;
    selectedSpatialFeatureId: string;
}

export interface ICoscradMap {
    (props: CoscradMapProps): JSX.Element;
}
