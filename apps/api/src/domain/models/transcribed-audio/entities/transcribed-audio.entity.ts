import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import isNumberWithinRange from 'apps/api/src/lib/validation/geometry/isNumberWithinRange';
import { PartialDTO } from 'apps/api/src/types/partial-dto';
import InconsistentTimeRangeError from '../../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { Valid } from '../../../domainModelValidators/Valid';
import { resourceTypes } from '../../../types/resourceTypes';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { Resource } from '../../resource.entity';
import { Transcript } from './Transcript';

export class TranscribedAudio extends Resource {
    readonly type = resourceTypes.transcribedAudio;

    readonly audioFilename: string;

    // we need to deal with units here
    readonly lengthMilliseconds: number;

    readonly startMilliseconds: number;

    readonly transcript: Transcript;

    constructor(dto: PartialDTO<TranscribedAudio>) {
        super({ ...dto, type: resourceTypes.transcribedAudio });

        const {
            audioFilename,
            lengthMilliseconds,
            startMilliseconds,
            transcript: transcriptDto,
        } = dto;

        this.audioFilename = audioFilename;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;

        this.transcript = new Transcript(transcriptDto);
    }

    validateTimeRangeContext({ timeRange }: TimeRangeContext): Valid | InternalError {
        const { inPoint, outPoint } = timeRange;

        /**
         * Note that the `startMilliseconds` doesn't have to be 0, so unlike the
         * geometric models, we do need to confirm here that `inPoint` isn't too low.
         */
        if (
            [inPoint, outPoint].some(
                (timePoint) => !isNumberWithinRange(timePoint, this.getTimeBounds())
            )
        )
            return new InconsistentTimeRangeError(timeRange, this);

        return Valid;
    }

    getTimeBounds(): [number, number] {
        return [this.startMilliseconds, this.getEndMilliseconds()];
    }

    getEndMilliseconds(): number {
        return this.startMilliseconds + this.lengthMilliseconds;
    }
}
