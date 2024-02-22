import { IVideoViewModel, MIMEType } from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, NonNegativeFiniteNumber, URL } from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { Transcript } from '../../../../domain/models/audio-visual/shared/entities/transcript.entity';
import { Video } from '../../../../domain/models/audio-visual/video/entities/video.entity';
import { MediaItem } from '../../../../domain/models/media-item/entities/media-item.entity';
import { isNullOrUndefined } from '../../../../domain/utilities/validation/is-null-or-undefined';
import { BaseViewModel } from '../base.view-model';

export class VideoViewModel extends BaseViewModel implements IVideoViewModel {
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name of the video',
    })
    readonly name: MultilingualText;

    @ApiProperty({
        example: 'https://www.mysounds.com/3pigs.mp4',
        description: 'a url where the client can fetch the video file',
    })
    @URL({
        label: 'video link',
        description: 'a web link to an accompanying digital video file',
    })
    readonly videoUrl: string;

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
     * TODO [https://www.pivotaltracker.com/story/show/184522235] Expose full
     * transcript in view model.
     */
    @NestedDataType(Transcript, {
        label: 'transcript',
        description: 'transcript for this video',
    })
    readonly transcript: Transcript;

    constructor(video: Video, allMediaItems: MediaItem[]) {
        super(video);

        const { transcript, mediaItemId, lengthMilliseconds, name } = video;

        this.lengthMilliseconds = lengthMilliseconds;

        this.transcript = isNullOrUndefined(transcript) ? null : new Transcript(transcript.toDTO());

        const { url, mimeType } = allMediaItems.find(({ id }) => id === mediaItemId);

        this.videoUrl = url;

        this.mimeType = mimeType;

        this.name = name;
    }
}
