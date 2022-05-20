import { IsOptional, IsStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import isNumberWithinRange from '../../../lib/validation/geometry/isNumberWithinRange';
import { DTO } from '../../../types/DTO';
import InconsistentTimeRangeError from '../../domainModelValidators/errors/context/invalidContextStateErrors/timeRangeContext/InconsistentTimeRangeError';
import { Valid } from '../../domainModelValidators/Valid';
import { resourceTypes } from '../../types/resourceTypes';
import { TimeRangeContext } from '../context/time-range-context/time-range-context.entity';
import { Resource } from '../resource.entity';

type ContributorAndRole = {
    contributorId: string;
    role: string;
};

export class Song extends Resource {
    readonly type = resourceTypes.song;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly title?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    readonly contributorAndRoles: ContributorAndRole[];

    readonly lyrics?: string; // lyric type - should allow three way translation in future

    @IsStringWithNonzeroLength()
    readonly audioURL: string;

    readonly lengthMilliseconds: number;

    readonly startMilliseconds: number;

    constructor(dto: DTO<Song>) {
        super({ ...dto, type: resourceTypes.song });

        if (!dto) return;

        const {
            title,
            titleEnglish,
            contributorAndRoles,
            lyrics,
            audioURL,
            lengthMilliseconds,
            startMilliseconds,
        } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributorAndRoles = cloneToPlainObject(contributorAndRoles);

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }

    validateTimeRangeContext({ timeRange }: TimeRangeContext): Valid | InternalError {
        const { inPoint, outPoint } = timeRange;

        const isNumberOutOfRange = (n: number): boolean =>
            !isNumberWithinRange(n, this.getTimeBounds());

        /**
         * Note that the `startMilliseconds` doesn't have to be 0, so we need to
         * confirm here that `inPoint` isn't too low.
         */
        if ([inPoint, outPoint].some(isNumberOutOfRange))
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
