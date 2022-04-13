import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { Position2D } from '../../spatial-feature/types/Coordinates/Position2D';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class PointContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.point2D;

    readonly point: Position2D;

    constructor({ point }: PartialDTO<PointContext>) {
        super();

        this.point = [...(point as Position2D)];
    }
}
