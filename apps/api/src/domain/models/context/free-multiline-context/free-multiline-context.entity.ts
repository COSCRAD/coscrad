import { DiscriminatedBy, NonEmptyString, Union2Member } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { Line2D } from '../../spatial-feature/types/Coordinates/Line2d';
import { EdgeConnectionContext } from '../context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export const EMPTY_DTO_INJECTION_TOKEN = 'EMPTY_DTO';

/**
 * A `free multiline` is a collection of one or more (typically
 * jagged) line segments specified as an ordered array of points. It's individual
 * lines are subject to no topological constraints. Figure eights, spirographs,
 * zig-zags, and so on are allowed.
 */

@Union2Member('EDGE_CONNECTION_CONTEXT_UNION', EdgeConnectionContextType.freeMultiline)
@DiscriminatedBy(EdgeConnectionContextType.freeMultiline)
export class FreeMultilineContext extends EdgeConnectionContext {
    @NonEmptyString({
        label: 'type',
        description: 'free multiline',
    })
    readonly type = EdgeConnectionContextType.freeMultiline;

    readonly lines: Line2D[];

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<FreeMultilineContext>) {
        super();

        if (!dto) return;

        const { lines } = dto;

        // Avoid side-effects
        this.lines = Array.isArray(lines) && lines.length > 0 ? cloneToPlainObject(lines) : [];
    }
}
