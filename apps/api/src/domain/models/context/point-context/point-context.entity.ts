import { DTO } from '../../../../types/DTO';
import { Position2D } from '../../spatial-feature/types/Coordinates/Position2D';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

// TODO Add support for point2D context
// @UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.point2D)
export class PointContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.point2D;

    readonly point: Position2D;

    constructor(dto: DTO<PointContext>) {
        super();

        if (!dto) return;

        const { point } = dto;

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182005586]
         *
         * Remove cast.
         */
        this.point = [...(point as Position2D)];
    }
}
