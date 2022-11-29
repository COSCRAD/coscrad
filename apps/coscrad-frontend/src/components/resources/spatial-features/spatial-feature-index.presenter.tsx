/**
 * This is an attempted fix from: https://stackoverflow.com/a/59523791
 * For some reason the shadow of the place marker is a broken image link
 */
import 'leaflet/dist/images/marker-shadow.png';
import 'leaflet/dist/leaflet.css';
import { SpatialFeatureIndexState } from '../../../store/slices/resources';
import { ICoscradMap, SpatialFeatureDetailPresenter } from './map';
import './spatial-feature-index.presenter.css';

type SpatialFeatureIndexPresenterProps = SpatialFeatureIndexState & {
    initialZoom?: number;
    initialCentre?: [number, number];
    MapComponent: ICoscradMap;
    DetailPresenter: SpatialFeatureDetailPresenter;
};

/**
 * We may want to wrap leaflet behind our own API and inject it here.
 * TODO [https://www.pivotaltracker.com/story/show/183681839]
 * We may some day read the actions and allow for bulk command execution in
 * an index view.
 */
export const SpatialFeatureIndexPresenter = ({
    data: detailResult,
    initialCentre,
    initialZoom,
    MapComponent,
    DetailPresenter,
}: SpatialFeatureIndexPresenterProps) => {
    const spatialFeatures = detailResult.map(({ data }) => data);

    return (
        <MapComponent
            spatialFeatures={spatialFeatures}
            initialCentre={initialCentre}
            initialZoom={initialZoom}
            DetailPresenter={DetailPresenter}
        />
    );
};
