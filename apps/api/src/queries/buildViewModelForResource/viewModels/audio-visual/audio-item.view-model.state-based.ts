import { MIMEType } from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
    UUID,
} from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../../../domain/models/media-item/entities/media-item.entity';
import { AccessControlList } from '../../../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../../../domain/models/user-management/contributor';
import { BaseResourceViewModel } from '../base-resource.view-model';

export class StateBasedAudioItemViewModel extends BaseResourceViewModel {
    @NestedDataType(MultilingualText, {
        label: 'name',
        description: 'name of the audio item',
    })
    readonly name: MultilingualText;

    @ApiProperty({
        example: 'https://www.mysounds.com/3pigs.mp3',
        description: 'a url where the client can fetch the audio file',
    })
    @URL({
        label: 'audio link',
        description: 'a web link to an accompanying digital audio file',
    })
    readonly audioURL: string;

    @UUID({
        label: 'media item',
        description: 'a reference to the raw media item for this audio item',
    })
    readonly mediaItemId: string;

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
    @NonEmptyString({
        label: 'plain text',
        description: 'a plain-text representation of the transcript',
    })
    readonly text: string;

    readonly accessControlList: { allowedUserIds: string[]; allowedGroupIds: string[] } =
        new AccessControlList();

    readonly isPublished: boolean = false;

    constructor(
        audioItem: AudioItem,
        allMediaItems: MediaItem[],
        allContributors: CoscradContributor[],
        baseMediaUrl: string
    ) {
        super(audioItem, allContributors);

        const { transcript, mediaItemId, lengthMilliseconds, name } = audioItem;

        this.lengthMilliseconds = lengthMilliseconds;

        // TODO Send back the full data structure for rich presentation on the client
        this.text = transcript?.toString() || '';

        const { mimeType } = allMediaItems.find(({ id }) => id === mediaItemId);

        this.audioURL = `${baseMediaUrl}/${mediaItemId}`;

        this.mimeType = mimeType;

        this.name = name;
    }
}
