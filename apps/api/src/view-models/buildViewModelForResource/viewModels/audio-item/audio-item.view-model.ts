import { IAudioItemViewModel, MIMEType } from '@coscrad/api-interfaces';
import { ExternalEnum, NonEmptyString, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { AudioItem } from '../../../../domain/models/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../../domain/models/media-item/entities/media-item.entity';
import { BaseViewModel } from '../base.view-model';

export class AudioItemViewModel extends BaseViewModel implements IAudioItemViewModel {
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
        { id, transcript, mediaItemId, lengthMilliseconds }: AudioItem,
        allMediaItems: MediaItem[]
    ) {
        super({ id });

        this.lengthMilliseconds = lengthMilliseconds;

        // TODO Send back the full data structure for rich presentation on the client
        this.text = transcript?.toString() || '';

        const { url, mimeType } = allMediaItems.find(({ id }) => id === mediaItemId);

        this.audioURL = url;

        this.mimeType = mimeType;
    }
}
