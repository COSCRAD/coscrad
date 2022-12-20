import { ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { NonEmptyString, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { TranscribedAudio } from '../../../../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { BaseViewModel } from '../base.view-model';
import buildFullDigitalAssetURL from '../utilities/buildFullDigitalAssetURL';
import convertTimeRangeDataToPlainTextTranscript from './utilities/convertTimeRangeDataToPlainTextTranscript';

export class TranscribedAudioViewModel extends BaseViewModel implements ITranscribedAudioViewModel {
    readonly #baseAudioURL: string;

    @ApiProperty({
        example: 'https://www.mysounds.com/3pigs.mp3',
        description: 'a url where the client can fetch the audio file',
    })
    @URL({
        label: 'audio link',
        description: 'a web link to an accompanying digital audio file',
    })
    readonly audioURL: string;

    @ApiProperty({
        example: 0,
        description: 'the starting counter in milliseconds (to allow for an offset)',
    })

    // TODO consider removing this
    @NonNegativeFiniteNumber({
        label: 'start (ms)',
        description: 'the starting counter of the audio file in milliseconds',
    })
    readonly start: number;

    @ApiProperty({
        example: 13450,
        description: 'the length of the audio clip in milliseconds',
    })
    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: 'the length of the accompanying audio file in milliseconds',
    })
    readonly lengthMilliseconds: number;

    @ApiProperty({
        example: 'Once upon a time, there were three little pigs. They lived in the forest.',
        description: 'A plain text representation of the transcript',
    })

    /**
     * TODO Support multiple transcript formats:
     * - time-alligned
     * - three-way-translations
     * - general multi-lingual text?
     * - plain text
     */
    @NonEmptyString({
        label: 'plain text',
        description: 'a plain-text representation of the transcript',
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
        }: TranscribedAudio,
        baseAudioURL: string
    ) {
        super({ id });

        this.start = startMilliseconds;

        this.lengthMilliseconds = lengthMilliseconds;

        this.plainText = convertTimeRangeDataToPlainTextTranscript(timeRanges);

        this.#baseAudioURL = baseAudioURL;

        if (audioFilename) this.audioURL = this.#buildAudioURL(audioFilename);
    }

    #buildAudioURL(filename: string, extension = 'mp3'): string {
        return buildFullDigitalAssetURL(this.#baseAudioURL, filename, extension);
    }
}
