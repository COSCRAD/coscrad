import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../../types/DTO';
import BaseDomainModel from '../../../BaseDomainModel';
import { IToPlainArray } from '../../interfaces/to-plain-array.interface';
import { Position2D } from './position-2d.entity';

export class Line2D extends BaseDomainModel implements IToPlainArray<number[][]> {
    @NestedDataType(Position2D)
    readonly points: Position2D[];

    constructor({ points }: DTO<Line2D>) {
        super();

        this.points = Array.isArray(points) ? points.map((point) => new Position2D(point)) : null;
    }

    toPlainArray(): number[][] {
        return this.points.map((point) => point.toPlainArray());
    }
}
