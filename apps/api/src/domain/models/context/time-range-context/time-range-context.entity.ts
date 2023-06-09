import {
    FixedValue,
    NestedDataType,
    NonNegativeFiniteNumber,
    UnionMember,
} from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { TranscriptItem } from '../../audio-item/entities/transcript-item.entity';
import BaseDomainModel from '../../BaseDomainModel';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class TimeRange extends BaseDomainModel {
    @NonNegativeFiniteNumber({
        label: 'in point',
        description: 'starting time stamp',
    })
    readonly inPoint: number;

    @NonNegativeFiniteNumber({
        label: 'out point',
        description: 'ending time stamp',
    })
    readonly outPoint: number;

    constructor(dto: DTO<TimeRange>) {
        super();

        if (!dto) return;

        const { inPoint, outPoint } = dto;

        this.inPoint = inPoint;

        this.outPoint = outPoint;
    }
}

// We don't want the `data` type and we don't need OO baggage for this prop
// TODO Improve the naming
export type TimeRangeWithoutData = Pick<TranscriptItem, 'inPoint' | 'outPoint'>;

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.timeRange)
export class TimeRangeContext extends EdgeConnectionContext {
    @FixedValue({
        label: 'type',
        description: 'type',
    })
    readonly type = EdgeConnectionContextType.timeRange;

    @NestedDataType(TimeRange, {
        label: 'time range',
        description: 'specifies the time range (in and out points) of a segment of a media item',
    })
    timeRange: TimeRange;

    constructor(dto: DTO<TimeRangeContext>) {
        super();

        if (!dto) return;

        const { timeRange } = dto;

        this.timeRange = new TimeRange(timeRange);
    }
}
