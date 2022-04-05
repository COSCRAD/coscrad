import { PartialDTO } from 'apps/api/src/types/partial-dto';
import { entityTypes } from '../../../types/entityTypes';
import { Entity } from '../../entity';
import { Transcript } from './Transcript';

export class AudioWithTranscript extends Entity {
    readonly type = entityTypes.audioWithTranscript;

    readonly audioFilename: string;

    // we need to deal with units here
    readonly lengthMilliseconds: number;

    readonly startMilliseconds: number;

    readonly transcript: Transcript;

    constructor(dto: PartialDTO<AudioWithTranscript>) {
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
