import {
    GeometricFeatureType,
    ICategorizableDetailQueryResult,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Card, CardContent } from '@mui/material';
import {
    FloatSpacerDiv,
    SinglePropertyPresenter,
} from 'apps/coscrad-frontend/src/utils/generic-components';
import { useState } from 'react';
import { routes } from '../../../../app/routes/routes';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { ResourceNavLink } from '../../shared/resource-nav-link';
import { LineTextPresenter } from './line-text-presenter';
import { PointTextPresenter } from './point-text-presenter';
import { PolygonTextPresenter } from './polygon-text-presenter';
import styles from './spatial-feature-detail.thumbnail.presenter.module.scss';

interface HasCoordinates<T = unknown> {
    coordinates: T;
}

const lookupTable: { [K in GeometricFeatureType]: FunctionalComponent<HasCoordinates> } = {
    [GeometricFeatureType.point]: PointTextPresenter,
    [GeometricFeatureType.line]: LineTextPresenter,
    [GeometricFeatureType.polygon]: PolygonTextPresenter,
};

/**
 * Our current approach is to present a text summary of the coordinates for a
 * spatial feature in its thumbnail view.
 */
export const SpatialFeatureDetailThumbnailPresenter = (
    spatialFeature: ICategorizableDetailQueryResult<ISpatialFeatureViewModel>
): JSX.Element => {
    const [isExpanded, setIsExpanded] = useState(false);

    const { id, geometry, properties } = spatialFeature;

    if (!geometry) {
        throw new Error(`Spatial Feature: ${id} is missing geometry definition`);
    }

    if (!properties) {
        throw new Error(`Spatial Feature: ${id} is missing its properties`);
    }

    const { name, description, imageUrl } = properties;

    const { type: geometryType, coordinates } = geometry;

    const CoordinatesTextPresenter = lookupTable[geometryType];

    if (isNullOrUndefined(CoordinatesTextPresenter)) {
        throw new Error(
            `There is no thumbnail presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    return (
        <Card>
            <CardContent>
                <div data-testid={id} className={styles['preview']}>
                    <img src={imageUrl} alt={`For ${ResourceType.spatialFeature}/${id}`} />
                </div>
                <div className={styles['meta']}>
                    <SinglePropertyPresenter display="Spatial Feature ID" value={id} />
                    <SinglePropertyPresenter display="Name" value={name} />
                </div>
                <div className={styles['resource-nav-link']}>
                    <ResourceNavLink
                        linkURL={`/${routes.resources
                            .ofType(ResourceType.spatialFeature)
                            .detail(id)}`}
                    />
                </div>
                <FloatSpacerDiv />
            </CardContent>
        </Card>
    );
};
