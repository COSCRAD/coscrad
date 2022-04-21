import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { PolygonCoordinates } from './types/Coordinates/PolygonCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class Polygon extends Resource implements ISpatialFeature {
    readonly type = resourceTypes.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.polygon, PolygonCoordinates>;

    constructor(dto: PartialDTO<Polygon>) {
        super({ ...dto, type: resourceTypes.spatialFeature });

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as IGeometricFeature<
            typeof GeometricFeatureType.polygon,
            PolygonCoordinates
        >;
    }
}
