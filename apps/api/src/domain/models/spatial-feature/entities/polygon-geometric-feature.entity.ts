import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { IGeometricFeature } from '../interfaces/geometric-feature.interface';
import { GeometricFeatureType } from '../types/GeometricFeatureType';
import { Polygon2D } from './basic-geometry/polygon-2d.entity';

const geometricFeatureType = GeometricFeatureType.polygon;

export class PolygonGeometricFeature
    extends BaseDomainModel
    implements IGeometricFeature<typeof geometricFeatureType, Polygon2D>
{
    readonly type = GeometricFeatureType.polygon;

    readonly coordinates: Polygon2D;

    constructor({ coordinates }: DTO<PolygonGeometricFeature>) {
        super();

        this.coordinates = new Polygon2D(coordinates);
    }
}
