import {
    GeometricFeatureType,
    IDetailQueryResult,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ExpandLess as ExpandLessIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    Divider,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../../../app/routes/routes';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { LineTextPresenter } from './line-text-presenter';
import { PointTextPresenter } from './point-text-presenter';
import { PolygonTextPresenter } from './polygon-text-presenter';

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
export const SpatialFeatureDetailThumbnailPresenter = ({
    data: spatialFeature,
}: IDetailQueryResult<ISpatialFeatureViewModel>): JSX.Element => {
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

    if (CoordinatesTextPresenter === null || typeof CoordinatesTextPresenter === 'undefined') {
        throw new Error(
            `There is no thumbnail presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    return (
        <Card data-testid={id}>
            <CardContent>
                <CardHeader title={name} />
                <img height="100px" src={imageUrl} alt={`Spatial Feature ${id}`} />
                <br />
                {description}
                <br />

                <Divider />
                <CoordinatesTextPresenter coordinates={coordinates} />
                <Collapse in={isExpanded}>
                    <h3>GEOJSON</h3>
                    <pre>{JSON.stringify(spatialFeature, null, 2)}</pre>
                </Collapse>
                <Link to={`/${routes.resources.ofType(ResourceType.spatialFeature).detail(id)}`}>
                    View Spatial Feature
                </Link>
            </CardContent>
            <CardActionArea>
                <CardActions>
                    <span aria-label="View Full JSON" onClick={(_) => setIsExpanded(!isExpanded)}>
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </span>
                </CardActions>
            </CardActionArea>
        </Card>
    );
};
