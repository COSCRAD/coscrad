import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { Valid } from '../../../domainModelValidators/Valid';
import { AggregateCompositeIdentifier } from '../../../types/AggregateCompositeIdentifier';
import { ResourceType } from '../../../types/ResourceType';
import { TimeRangeContext } from '../../context/time-range-context/time-range-context.entity';
import { Resource } from '../../resource.entity';
import validateTimeRangeContextForModel from '../../shared/contextValidators/validateTimeRangeContextForModel';
import { Transcript } from './Transcript';

@RegisterIndexScopedCommands([])
export class TranscribedAudio extends Resource {
    readonly type = ResourceType.transcribedAudio;

    @NonEmptyString({
        label: 'audio file name',
        description: 'the name (not full path) of the audio file',
    })
    readonly audioFilename: string;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: 'the length of the corresponding audio file in milliseconds',
    })
    readonly lengthMilliseconds: number;

    // TODO consider removing this
    @NonNegativeFiniteNumber({
        label: 'start (ms)',
        description: 'the starting timestamp in milliseconds',
    })
    readonly startMilliseconds: number;

    @NestedDataType(Transcript, {
        label: 'transcript',
        description: "a digital representation of the transcript's text",
    })
    readonly transcript: Transcript;

    constructor(dto: DTO<TranscribedAudio>) {
        super({ ...dto, type: ResourceType.transcribedAudio });

        if (!dto) return;

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

    protected validateComplexInvariants(): InternalError[] {
        return [];
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return [];
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

    protected getResourceSpecificAvailableCommands(): string[] {
        return [];
    }
}
