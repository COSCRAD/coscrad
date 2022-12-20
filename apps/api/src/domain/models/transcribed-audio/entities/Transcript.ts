import { NestedDataType } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { MediaTimeRange } from './MediaTimeRange';

export class Transcript extends BaseDomainModel {
    @NestedDataType(MediaTimeRange, {
        isArray: true,
        label: 'time aligned text',
        description: 'time stamps with text',
    })
    // TODO rename this, as it includes the data as well
    timeRanges: MediaTimeRange[];

    constructor(dto: DTO<Transcript>) {
        super();

        if (!dto) return;

        const { timeRanges } = dto;

        this.timeRanges = Array.isArray(timeRanges)
            ? timeRanges.map((timerange) => new MediaTimeRange(timerange))
            : null;
    }
}
