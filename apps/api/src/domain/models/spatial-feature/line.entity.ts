import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../types/entityTypes';
import { Entity } from '../entity';
import { IGeometricFeature } from './GeometricFeature';
import { ISpatialFeature } from './ISpatialFeature';
import { LineCoordinates } from './types/Coordinates/LineCoordinates';
import { GeometricFeatureType } from './types/GeometricFeatureType';

export class Line extends Entity implements ISpatialFeature {
    readonly type = entityTypes.spatialFeature;

    readonly geometry: IGeometricFeature<typeof GeometricFeatureType.line, LineCoordinates>;

    constructor(dto: PartialDTO<Line>) {
        super(dto);

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
