import {
    GeometricFeatureType,
    IDetailQueryResult,
    ISpatialFeatureViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import {
    ExpandLess as ExpandLessIcon,
    ExpandMore as ExpandMoreIcon,
    LinkSharp as LinkIcon,
} from '@mui/icons-material';
import {
    Card,
    CardActionArea,
    CardActions,
    CardContent,
    CardHeader,
    Collapse,
    Divider,
    IconButton,
} from '@mui/material';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { routes } from '../../../../app/routes/routes';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { LinePresenter } from './line-presenter';
import { PointPresenter } from './point-presenter';
import { PolygonPresenter } from './polygon-presenter';

interface HasCoordinates<T = unknown> {
    coordinates: T;
}

const lookupTable: { [K in GeometricFeatureType]: FunctionalComponent<HasCoordinates> } = {
    [GeometricFeatureType.point]: PointPresenter,
    [GeometricFeatureType.line]: LinePresenter,
    [GeometricFeatureType.polygon]: PolygonPresenter,
};

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

    const CoordinatesPresenter = lookupTable[geometryType];

    if (CoordinatesPresenter === null || typeof CoordinatesPresenter === 'undefined') {
        throw new Error(
            `There is no thumbnail presenter registered for coordinates of geometry type: ${geometryType}`
        );
    }

    /**
     * TODO Wrap additional non-coordinate presentation around this.
     */
    return (
        <Card>
            <CardContent>
                <CardHeader title={name} />
                <img height="100px" src={imageUrl} alt={`Spatial Feature ${id}`} />
                <br />
                {description}
                <br />

                <Divider />
                <CoordinatesPresenter coordinates={coordinates} />
                <Collapse in={isExpanded}>
                    <h3>JSON Data</h3>
                    <pre>{JSON.stringify(spatialFeature, null, 2)}</pre>
                </Collapse>
            </CardContent>
            <CardActionArea>
                <CardActions>
                    <Link
                        to={`/${routes.resources.ofType(ResourceType.spatialFeature).detail(id)}`}
                    >
                        <IconButton aria-label="View">
                            <LinkIcon></LinkIcon>
                        </IconButton>
                    </Link>
                    <IconButton
                        aria-label="View Full JSON"
                        onClick={(_) => setIsExpanded(!isExpanded)}
                    >
                        {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                </CardActions>
            </CardActionArea>
        </Card>
    );
};
