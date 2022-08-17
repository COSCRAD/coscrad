import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { MediaTimeRange } from './MediaTimeRange';

export class Transcript extends BaseDomainModel {
    // TODO rename this, as it includes the data as well
    timeRanges: MediaTimeRange[];

    constructor(dto: DTO<Transcript>) {
        super();

        if (!dto) return;

        const { timeRanges } = dto;

        this.timeRanges = timeRanges.map((timerange) => new MediaTimeRange(timerange));
    }
}
