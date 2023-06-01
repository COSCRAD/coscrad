import { Union2Member } from '@coscrad/data-types';
import { Inject } from '@nestjs/common';
import cloneToPlainObject from '../../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../../types/DTO';
import { TranscriptItem } from '../../audio-item/entities/transcript-item.entity';
import { EdgeConnectionContext } from '../context.entity';
import { EDGE_CONNECTION_CONTEXT_UNION } from '../edge-connection.entity';
import { EMPTY_DTO_INJECTION_TOKEN } from '../free-multiline-context/free-multiline-context.entity';
import { EdgeConnectionContextType } from '../types/EdgeConnectionContextType';

// We don't want the `data` type and we don't need OO baggage for this prop
// TODO Improve the naming
export type TimeRangeWithoutData = Pick<TranscriptItem, 'inPoint' | 'outPoint'>;

@Union2Member(EDGE_CONNECTION_CONTEXT_UNION, EdgeConnectionContextType.timeRange)
export class TimeRangeContext extends EdgeConnectionContext {
    readonly type = EdgeConnectionContextType.timeRange;

    timeRange: TimeRangeWithoutData;

    constructor(@Inject(EMPTY_DTO_INJECTION_TOKEN) dto: DTO<TimeRangeContext>) {
        super();

        if (!dto) return;

        const { timeRange } = dto;

        // avoid side-effects
        this.timeRange = cloneToPlainObject(timeRange);
    }
}
