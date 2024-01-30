import { AggregateType, IAudioItemViewModel, MIMEType } from '@coscrad/api-interfaces';
import {
    ExternalEnum,
    NestedDataType,
    NonEmptyString,
    NonNegativeFiniteNumber,
    URL,
} from '@coscrad/data-types';
import { ApiProperty } from '@nestjs/swagger';
import { MultilingualText } from '../../../../domain/common/entities/multilingual-text';
import { AudioItem } from '../../../../domain/models/audio-item/entities/audio-item.entity';
import { EdgeConnection } from '../../../../domain/models/context/edge-connection.entity';
import { MediaItem } from '../../../../domain/models/media-item/entities/media-item.entity';
import { NoteViewModel } from '../../../edgeConnectionViewModels/note.view-model';
import { BaseViewModel } from '../base.view-model';

export class AudioItemViewModel extends BaseViewModel implements IAudioItemViewModel {
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

    @NonEmptyString({
        label: 'annotations',
        description: 'time-range contextualized notes for this audio item',
    })
    readonly annotations: NoteViewModel[];

    constructor(audioItem: AudioItem, allMediaItems: MediaItem[], allNotes: EdgeConnection[]) {
        super(audioItem);

        const { transcript, mediaItemId, lengthMilliseconds, name } = audioItem;

        this.lengthMilliseconds = lengthMilliseconds;

        // TODO Send back the full data structure for rich presentation on the client
        this.text = transcript?.toString() || '';

        const { url, mimeType } = allMediaItems.find(({ id }) => id === mediaItemId);

        this.audioURL = url;

        this.mimeType = mimeType;

        this.name = name;

        this.annotations = this.findMyAnnotations(allNotes).map(
            (edgeConnection) => new NoteViewModel(edgeConnection)
        );
    }

    private findMyAnnotations(allNotes: EdgeConnection[]) {
        return allNotes.filter((note) => {
            return (
                note.isAudioVisualAnnotation() &&
                note.concerns({
                    type: AggregateType.audioItem,
                    id: this.id,
                })
            );
        });
    }
}
