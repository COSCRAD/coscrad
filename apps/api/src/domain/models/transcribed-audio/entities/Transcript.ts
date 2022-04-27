import { DTO } from 'apps/api/src/types/DTO';
import BaseDomainModel from '../../BaseDomainModel';
import { MediaTimeRange } from './MediaTimeRange';

export class Transcript extends BaseDomainModel {
    // TODO rename this, as it includes the data as well
    timeRanges: MediaTimeRange[];

    constructor({ timeRanges }: DTO<Transcript>) {
        super();

        this.timeRanges = timeRanges.map((timerange) => new MediaTimeRange(timerange));
    }
}
