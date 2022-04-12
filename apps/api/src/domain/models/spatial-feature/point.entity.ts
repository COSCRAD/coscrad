import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../types/resourceTypes';
import { EdgeConnectionContextType } from '../context/types/EdgeConnectionContextType';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { PointCoordinates } from './types/Coordinates/PointCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class Point extends Resource implements ISpatialFeature {
    readonly type = resourceTypes.spatialFeature;

    readonly allowedContextTypes = [EdgeConnectionContextType.general];

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.point, PointCoordinates>;

    constructor(dto: PartialDTO<Point>) {
        super(dto);

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as IGeometricFeature<
            typeof GeometricFeatureType.point,
            PointCoordinates
        >;
    }
}
