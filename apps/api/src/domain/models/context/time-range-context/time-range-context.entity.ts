import { UnionMember } from '@coscrad/data-types';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { TranscriptItem } from '../../audio-item/entities/transcript-item.entity';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

// We don't want the `data` type and we don't need OO baggage for this prop
// TODO Improve the naming
export type TimeRangeWithoutData = Pick<TranscriptItem, 'inPoint' | 'outPoint'>;

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.timeRange)
export class TimeRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.timeRange;

    timeRange: TimeRangeWithoutData;

    constructor(dto: DTO<TimeRangeContext>) {
        super();

        if (!dto) return;

        const { timeRange } = dto;

        // avoid side-effects
        this.timeRange = cloneToPlainObject(timeRange);
    }
}
