import { ITranscribedAudioViewModel, MIMEType } from '@coscrad/api-interfaces';
import { ExternalEnum, NonEmptyString, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MediaItem } from '../../../../domain/models/media-item/entities/media-item.entity';
import { Transcript } from '../../../../domain/models/transcribed-audio/entities/transcribed-audio.entity';
import { BaseViewModel } from '../base.view-model';
import convertTimeRangeDataToPlainTextTranscript from './utilities/convertTimeRangeDataToPlainTextTranscript';

export class TranscribedAudioViewModel extends BaseViewModel implements ITranscribedAudioViewModel {
    @NonEmptyString({
        label: 'name',
        description: 'name of the transcript',
    })
    readonly name: string;

    @ApiProperty({
        example: 'https://www.mysounds.com/3pigs.mp3',
        description: 'a url where the client can fetch the audio file',
    })
    @URL({
        label: 'audio link',
        description: 'a web link to an accompanying digital audio file',
    })
    readonly audioURL: string;

    @ExternalEnum(
        {
            labelsAndValues: Object.entries(MIMEType).map(([label, value]) => ({ label, value })),
            enumLabel: 'MIME type',
            enumName: 'MIMEType',
        },
        {
            label: 'MIME type',
            description: 'the media format type',
        }
    )
    readonly mimeType: MIMEType;

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
    readonly text: string;

    // TODO Also return the raw time stamp data?

    constructor(
        { id, items, mediaItemId, lengthMilliseconds }: Transcript,
        allMediaItems: MediaItem[]
    ) {
        super({ id });

        this.lengthMilliseconds = lengthMilliseconds;

        this.text = convertTimeRangeDataToPlainTextTranscript(items);

        const { url, mimeType } = allMediaItems.find(({ id }) => id === mediaItemId);

        this.audioURL = url;

        this.mimeType = mimeType;
    }
}
