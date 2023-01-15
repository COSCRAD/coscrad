import { ISpatialFeatureViewModel, ResourceType } from '@coscrad/api-interfaces';
import {
    FloatSpacerDiv,
    SinglePropertyPresenter,
} from 'apps/coscrad-frontend/src/utils/generic-components';
import { CoscradLeafletMap } from './leaflet';
import styles from './polygon-spatial-feature-detail.full-view.presenter.module.scss';
import { SpatialFeatureDetailThumbnailPresenter } from './thumbnail-presenters';
import { MultiPolygon2D, Position2D } from './types';

export const PolygonSpatialFeatureDetailFullViewPresenter = (
    spatialFeature: ISpatialFeatureViewModel
): JSX.Element => {
    const { id, geometry, properties } = spatialFeature;
    const { type, coordinates } = geometry;
    const { name, description, imageUrl } = properties;

    /**
     * TODO: find centre of polygon rather than first point of first linear ring
     */
    const firstLinearRing = [...(coordinates as MultiPolygon2D)].shift();
    const initialCentreCoordinates = firstLinearRing[0].map((line2D) => line2D) as Position2D;

    return (
        <>
            <div className={styles['map']}>
                <CoscradLeafletMap
                    spatialFeatures={[spatialFeature]}
                    initialCentre={initialCentreCoordinates}
                    initialZoom={8}
                    DetailPresenter={SpatialFeatureDetailThumbnailPresenter}
                    onSpatialFeatureSelected={() => null}
                    selectedSpatialFeatureId={''}
                />
            </div>
            <FloatSpacerDiv />
            <div data-testid={id} className={styles['preview']}>
                <img src={imageUrl} alt={`For ${ResourceType.spatialFeature}/${id}`} />
            </div>
            <div className={styles['meta']}>
                <SinglePropertyPresenter display="Type" value={type} />
                <SinglePropertyPresenter display="Name" value={name} />
                <SinglePropertyPresenter display="Description" value={description} />
            </div>
            <FloatSpacerDiv />
        </>
    );
};
