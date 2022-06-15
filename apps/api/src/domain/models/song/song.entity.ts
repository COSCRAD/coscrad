import {
    IsNonNegativeFiniteNumber,
    IsOptional,
    IsStringWithNonzeroLength,
    IsUrl,
    ValidateNested,
} from '@coscrad/validation';
import { CommandWriteContext } from '../../../app/controllers/command/services/command-info-service';
import { InternalError } from '../../../lib/errors/InternalError';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import songValidator from '../../domainModelValidators/songValidator';
import { Valid } from '../../domainModelValidators/Valid';
import { ResourceType } from '../../types/ResourceType';
import { TimeRangeContext } from '../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../interfaces/ITimeBoundable';
import { Resource } from '../resource.entity';
import validateTimeRangeContextForModel from '../shared/contextValidators/validateTimeRangeContextForModel';
import { ContributorAndRole } from './ContributorAndRole';

export class Song extends Resource implements ITimeBoundable, CommandWriteContext {
    readonly type = ResourceType.song;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly title?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    @ValidateNested()
    readonly contributorAndRoles: ContributorAndRole[];

    @IsOptional()
    @IsStringWithNonzeroLength()
    // the type of `lyrics` should allow three way translation in future
    readonly lyrics?: string;

    @IsUrl()
    readonly audioURL: string;

    @IsNonNegativeFiniteNumber()
    readonly lengthMilliseconds: number;

    @IsNonNegativeFiniteNumber()
    readonly startMilliseconds: number;

    constructor(dto: DTO<Song>) {
        super({ ...dto, type: ResourceType.song });

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

        this.contributorAndRoles = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }

    getAvailableCommands(): string[] {
        const allCommands = ['CREATE_SONG', 'PUBLISH_SONG'];

        // There's no reason to publish a Song that is already published.
        if (this.published) return ['CREATE_SONG'];

        return allCommands;
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return songValidator(this);
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): Valid | InternalError {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    getTimeBounds(): [number, number] {
        return [this.startMilliseconds, this.getEndMilliseconds()];
    }

    getEndMilliseconds(): number {
        return this.startMilliseconds + this.lengthMilliseconds;
    }
}
