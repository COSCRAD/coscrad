import { NestedDataType } from '../../../../../../../libs/data-types/src';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { IGeometricFeature } from '../interfaces/geometric-feature.interface';
import { GeometricFeatureType } from '../types/GeometricFeatureType';
import { Position2D } from './basic-geometry/position-2d.entity';

export class PointGeometricFeature
    extends BaseDomainModel
    implements IGeometricFeature<typeof GeometricFeatureType.point, Position2D>
{
    readonly type = GeometricFeatureType.point;

    @NestedDataType(Position2D)
    readonly coordinates: Position2D;

    constructor({ coordinates }: DTO<PointGeometricFeature>) {
        super();

        this.coordinates = new Position2D(coordinates);
    }
}
