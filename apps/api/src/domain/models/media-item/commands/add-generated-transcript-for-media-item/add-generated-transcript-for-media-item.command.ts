import { AggregateType } from '@coscrad/api-interfaces';
import { Command, ICommand } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, RawDataObject } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { DTO } from '../../../../../types/DTO';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { MediaItemCompositeId } from '../create-media-item';

@CoscradDataExample<AddGeneratedTranscriptForMediaItem>({
    example: {
        aggregateCompositeIdentifier: {
            type: AggregateType.mediaItem,
            id: buildDummyUuid(1),
        },
        source: 'pocket-sphynx',
        version: '2.4.1',
        transcript: {
            data: 'foo bar baz',
        },
    },
})
@Command({
    type: 'ADD_GENERATED_TRANSCRIPT_FOR_MEDIA_ITEM',
    label: 'Add Generated Transcript',
    description: 'Upload a machine generated transcript for a raw audio or video media item',
})
export class AddGeneratedTranscriptForMediaItem implements ICommand {
    @NestedDataType(MediaItemCompositeId, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier`,
    })
    readonly aggregateCompositeIdentifier: MediaItemCompositeId;

    @NonEmptyString({
        label: 'source',
        description: 'the name of the service used to generate the raw transcript',
    })
    readonly source: string;

    @NonEmptyString({
        label: 'verson',
        description: 'the semantic version of the service used to generate the raw transcript',
    })
    readonly version: string;

    @RawDataObject({
        label: 'transcript',
        description: 'a machine generated transcript for a raw audio or video item',
    })
    readonly transcript: Record<string, unknown>;

    public static fromDto(dto: DTO<AddGeneratedTranscriptForMediaItem>) {
        const c = new AddGeneratedTranscriptForMediaItem();

        Object.assign(c, dto);

        return dto;
    }
}
