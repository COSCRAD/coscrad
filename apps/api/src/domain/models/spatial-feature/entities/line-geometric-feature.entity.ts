import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { IGeometricFeature } from '../interfaces/geometric-feature.interface';
import { GeometricFeatureType } from '../types/GeometricFeatureType';
import { Line2D } from './basic-geometry/line-2d.entity';

export class LineGeometricFeature
    extends BaseDomainModel
    implements IGeometricFeature<typeof GeometricFeatureType.line, Line2D>
{
    readonly type = GeometricFeatureType.line;

    @NestedDataType(Line2D)
    readonly coordinates: Line2D;

    constructor({ coordinates }: DTO<LineGeometricFeature>) {
        super();

        this.coordinates = new Line2D(coordinates);
    }
}
