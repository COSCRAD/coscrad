import { DTO } from 'apps/api/src/types/DTO';
import { resourceTypes } from '../../types/resourceTypes';
import { Resource } from '../resource.entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { LineCoordinates } from './types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class Line extends Resource implements ISpatialFeature {
    readonly type = resourceTypes.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>;

    constructor(dto: DTO<Line>) {
        super({ ...dto, type: resourceTypes.spatialFeature });

        const { geometry: geometryDTO } = dto;

        /**
         * Do we want a class instead of a type for this property? Either way,
         * this should already have been validated at this point.
         */
        this.geometry = geometryDTO as IGeometricFeature<
            typeof GeometricFeatureType.line,
            LineCoordinates
        >;
    }
}
