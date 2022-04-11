import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { resourceTypes } from '../../../types/resourceTypes';
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
        super(dto);

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
}
