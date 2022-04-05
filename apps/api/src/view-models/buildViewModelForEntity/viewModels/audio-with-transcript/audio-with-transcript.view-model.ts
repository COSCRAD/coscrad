import { ApiProperty } from '@nestjs/swagger';
import { AudioWithTranscript } from 'apps/api/src/domain/models/audio-with-transcript/entities/audio-with-transcript.entity';
import { EntityId } from 'apps/api/src/domain/models/types/EntityId';
import buildFullAudioURL from '../utilities/buildFullAudioURL';
import convertTimeRangeDataToPlainTextTranscript from './utilities/convertTimeRangeDataToPlainTextTranscript';

export class AudioWithTranscriptViewModel {
    readonly #baseAudioURL: string;

    @ApiProperty({
        example: '12',
        description: 'uniquely identifies a tag amongst other tags',
    })
    readonly id: EntityId;

    @ApiProperty({
        example: 'https://www.mysounds.com/3pigs.mp3',
        description: 'a url where the client can fetch the audio file',
    })
    readonly audioURL: string;

    @ApiProperty({
        example: 0,
        description: 'the starting counter in milliseconds (to allow for an offset)',
    })
    readonly start: number;

    @ApiProperty({
        example: 13450,
        description: 'the length of the audio clip in milliseconds',
    })
    readonly length: number;

    @ApiProperty({
        example: 'Once upon a time, there were three little pigs. They lived in the forest.',
        description: 'A plain text representation of the transcript',
    })
    readonly plainText: string;

    // TODO Also return the raw time stamp data?

    constructor(
        {
            id,
            transcript: { timeRanges },
            audioFilename,
            startMilliseconds,
            lengthMilliseconds,
        }: AudioWithTranscript,
        baseAudioURL: string
    ) {
        this.id = id;

        this.start = startMilliseconds;

        this.length = lengthMilliseconds;

        this.plainText = convertTimeRangeDataToPlainTextTranscript(timeRanges);

        this.#baseAudioURL = baseAudioURL;

        if (audioFilename) this.audioURL = this.#buildAudioURL(audioFilename);
    }

    #buildAudioURL(filename: string, extension = 'mp3'): string {
        return buildFullAudioURL(this.#baseAudioURL, filename, extension);
    }
}
