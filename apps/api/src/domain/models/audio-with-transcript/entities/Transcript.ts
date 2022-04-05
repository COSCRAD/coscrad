import { PartialDTO } from 'apps/api/src/types/partial-dto';
import BaseDomainModel from '../../BaseDomainModel';
import { MediaTimeRange } from './MediaTimeRange';

export class Transcript extends BaseDomainModel {
    // TODO rename this, as it includes the data as well
    timeRanges: MediaTimeRange[];

    constructor({ timeRanges }: PartialDTO<Transcript>) {
        super();

        // Avoid sharing side-effect references
        // TODO Why is the cast necessary? Fix PartialDTO.
        this.timeRanges = (timeRanges as MediaTimeRange[]).map(
            (timerange) => new MediaTimeRange(timerange)
        );
    }
}
