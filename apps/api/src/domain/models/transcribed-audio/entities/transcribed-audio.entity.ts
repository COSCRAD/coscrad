import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../../types/entityTypes';
import { Entity } from '../../entity';
import { Transcript } from './Transcript';

export class TranscribedAudio extends Entity {
    readonly type = entityTypes.transcribedAudio;

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
