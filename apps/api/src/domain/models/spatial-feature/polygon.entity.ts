import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../types/entityTypes';
import { Entity } from '../entity';
import { GeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { PolygonCoordinates } from './types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class Polygon extends Entity implements ISpatialFeature {
    readonly type = entityTypes.spatialFeature;

    readonly geometry: GeometricFeature<typeof GeometricFeatureType.polygon, PolygonCoordinates>;

    constructor(dto: PartialDTO<Polygon>) {
        super(dto);

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as GeometricFeature<
            typeof GeometricFeatureType.polygon,
            PolygonCoordinates
        >;
    }
}
