import { UnionMember } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import { DTO } from '../../../../types/DTO';
import { Position2D } from '../../spatial-feature/types/Coordinates/Position2D';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EMPTY_DTO_INJECTION_TOKEN } from '../free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.point2D)
export class PointContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.point2D;

    readonly point: Position2D;

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<PointContext>) {
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
