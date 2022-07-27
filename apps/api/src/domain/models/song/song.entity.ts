import {
    IsNonNegativeFiniteNumber,
    IsOptional,
    IsStringWithNonzeroLength,
    IsUrl,
    ValidateNested,
} from '@coscrad/validation';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import { DTO } from '../../../types/DTO';
import { ResultOrError } from '../../../types/ResultOrError';
import songValidator from '../../domainModelValidators/songValidator';
import { Valid } from '../../domainModelValidators/Valid';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { TimeRangeContext } from '../context/time-range-context/time-range-context.entity';
import { ITimeBoundable } from '../interfaces/ITimeBoundable';
import { Resource } from '../resource.entity';
import validateTimeRangeContextForModel from '../shared/contextValidators/validateTimeRangeContextForModel';
import getId from '../shared/functional/getId';
import { ContributorAndRole } from './ContributorAndRole';

@RegisterIndexScopedCommands(['CREATE_SONG'])
export class Song extends Resource implements ITimeBoundable {
    readonly type = ResourceType.song;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly title?: string;

    @IsOptional()
    @IsStringWithNonzeroLength()
    readonly titleEnglish?: string;

    @ValidateNested()
    readonly contributions: ContributorAndRole[];

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
            contributions: contributorAndRoles,
            lyrics,
            audioURL,
            lengthMilliseconds,
            startMilliseconds,
        } = dto;

        this.title = title;

        this.titleEnglish = titleEnglish;

        this.contributions = (contributorAndRoles || []).map(
            (contributorAndRoleDTO) => new ContributorAndRole(contributorAndRoleDTO)
        );

        this.lyrics = lyrics;

        this.audioURL = audioURL;

        this.lengthMilliseconds = lengthMilliseconds;

        this.startMilliseconds = startMilliseconds;
    }

    protected getResourceSpecificAvailableCommands(): string[] {
        const allCommands = ['PUBLISH_SONG'];

        // There's no reason to publish a Song that is already published.
        if (this.published) return [];

        return allCommands;
    }

    validateInvariants(): ResultOrError<typeof Valid> {
        return songValidator(this);
    }

    /**
     * The state here is the state of the system **prior** to creating or updating
     * this instance.
     */
    validateExternalState({ resources: { song: allSongs } }: InMemorySnapshot): ValidationResult {
        if (allSongs.map(getId).includes(this.id)) {
            return new InternalError(`There is already a Song with id: ${this.id}}`);
        }

        return Valid;
    }

    validateTimeRangeContext(timeRangeContext: TimeRangeContext): ValidationResult {
        return validateTimeRangeContextForModel(this, timeRangeContext);
    }

    getTimeBounds(): [number, number] {
        return [this.startMilliseconds, this.getEndMilliseconds()];
    }

    getEndMilliseconds(): number {
        return this.startMilliseconds + this.lengthMilliseconds;
    }
}
