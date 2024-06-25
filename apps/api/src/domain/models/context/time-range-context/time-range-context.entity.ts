import { ITimeRangeContext } from '@coscrad/api-interfaces';
import {
    FixedValue,
    NestedDataType,
    NonNegativeFiniteNumber,
    UnionMember,
} from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import { TranscriptItem } from '../../audio-visual/shared/entities/transcript-item.entity';
import BaseDomainModel from '../../base-domain-model.entity';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection-context-union';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

export class TimeRange extends BaseDomainModel {
    @NonNegativeFiniteNumber({
        label: 'in point (ms)',
        description: 'starting time stamp in milliseconds',
    })
    readonly inPointMilliseconds: number;

    @NonNegativeFiniteNumber({
        label: 'out point (ms)',
        description: 'ending time stamp in milliseconds',
    })
    readonly outPointMilliseconds: number;

    constructor(dto: DTO<TimeRange>) {
        super();

        if (!dto) return;

        const { inPointMilliseconds, outPointMilliseconds } = dto;

        this.inPointMilliseconds = inPointMilliseconds;

        this.outPointMilliseconds = outPointMilliseconds;
    }
}

// TODO Remove this in favor of a proper data class
export type TimeRangeWithoutData = Pick<
    TranscriptItem,
    'inPointMilliseconds' | 'outPointMilliseconds'
>;

@UnionMember(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.timeRange)
export class TimeRangeContext extends EdgeConnectionContext implements ITimeRangeContext {
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
