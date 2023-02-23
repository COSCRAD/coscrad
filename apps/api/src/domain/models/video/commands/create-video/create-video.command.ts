import { AggregateCompositeIdentifier, AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import {
    CoscradMultilingualText,
    NestedDataType,
    NonNegativeFiniteNumber,
    ReferenceTo,
    UUID,
} from '@coscrad/data-types';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { AggregateId } from '../../../../types/AggregateId';
import { CoscradTimeStamp } from '../../../audio-item/entities/audio-item.entity';
import { VideoCompositeIdentifier } from '../../entities';
import { CREATE_VIDEO } from '../constants';

@Command({
    type: CREATE_VIDEO,
    label: 'Create Video',
    description: 'Create a new video',
})
export class CreateVideo implements ICommandBase {
    @NestedDataType(VideoCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier;

    @CoscradMultilingualText({
        label: 'name',
        description: 'the name of the video',
    })
    readonly name: MultilingualText;

    @ReferenceTo(AggregateType.mediaItem)
    @UUID({
        label: 'media item ID',
        description: `the ID of the audio item's media item`,
    })
    readonly mediaItemId: AggregateId;

    @NonNegativeFiniteNumber({
        label: 'length (ms)',
        description: "the length of the audio item's media item in milliseconds",
    })
    readonly lengthMilliseconds: CoscradTimeStamp;
}
